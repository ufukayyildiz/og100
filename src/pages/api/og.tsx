import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { fetchHTML } from "@/lib/fetch";
import { getSiteMetaDataFromHTML } from "@/lib/parser";

export const config = {
  runtime: "edge",
};

function getURLFromRequest(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let url = searchParams.get("url")?.trim();

  if (!url) {
    return "https://github.com/ufukayyildiz/ogimage";
  }

  if (!url.startsWith("http")) {
    url = `http://${url}`;
  }

  return url;
}

// Shorten string without cutting words in JavaScript
function shortenString(str: string, maxLength: number) {
  let words = str.split(" ");
  let shortened = "";

  while (words.length > 0) {
    let word = words.shift();
    if ((shortened + word).length > maxLength) break;
    shortened += word + " ";
  }

  if (shortened.length < str.length) {
    shortened += "...";
  }
  return shortened;
}

export default async function handler(req: NextRequest) {
  try {
    const url = getURLFromRequest(req);
    const html = await fetchHTML(url);
    const metaData = getSiteMetaDataFromHTML(url, html);
    console.log(metaData);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            // linear-gradient
            background: `linear-gradient(0, ${metaData.color} 0%, #f50ae1 30%)`,
          }}
        >
          <div
            style={{
              display: "flex",
              margin: "40px",
              fontSize: "40px",
              color: "#222222",
            }}
          >
            {
              // if metaData.favicon is undefined, then don't render the image
              metaData.favicon && (
                <img
                  width="100"
                  height="100"
                  src={metaData.favicon}
                  style={{
                    marginRight: "10px",
                  }}
                />
              )
            }
           
          </div>
          <div
            style={{
              margin: "0px 40px 0px 40px",
              minHeight: "100px",
              maxHeight: "200px",
              fontSize: "60px",
              fontWeight: "700",
              color: "#FFFFFF",
              lineHeight: "100%",
              wordBreak: "break-word",
            }}
          >
            {shortenString(metaData.title, 140)}
          </div>
       <center>   <div
            style={{
              margin: "40px",
              fontSize: "25px",
              color: "#555555",
            }}
          >
            {shortenString(metaData.description, 200)}
          </div> </center>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
