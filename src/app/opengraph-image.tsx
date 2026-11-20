import { ImageResponse } from "next/og";

// The preview image shown when a link to the site is shared (WhatsApp, Facebook, X, LinkedIn).
export const alt = "Jaider Feliciana — Websites, social media & ads in Aruba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #171233 0%, #2a1d63 55%, #6a3ff2 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #6a3ff2, #d94ecb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            JF
          </div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>Jaider Feliciana</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
            Websites that bring you more customers
          </div>
          <div style={{ fontSize: 30, color: "#d9d2ff" }}>
            Websites · Social media · Meta & Google Ads · Branding · SEO
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#d9d2ff" }}>
          <div>Oranjestad, Aruba</div>
          <div style={{ color: "#f0a8e8" }}>Free consultation · jaiderfeliciana.com</div>
        </div>
      </div>
    ),
    size,
  );
}
