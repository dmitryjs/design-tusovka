import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_ALT } from "@/lib/site-metadata";

export const runtime = "nodejs";

export const alt = SITE_OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoData = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFFFFF",
          border: "1px solid #E5E5E5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
          }}
        >
          <img
            src={logoSrc}
            alt=""
            width={220}
            height={220}
            style={{
              borderRadius: 9999,
              objectFit: "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 640,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#171717",
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.45,
                color: "#525252",
              }}
            >
              {SITE_DESCRIPTION}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 8,
            background: "#094BF5",
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
