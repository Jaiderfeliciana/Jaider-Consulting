"use client";

import { useState } from "react";
import { whatsappHref } from "@/content/site";

export default function ScanBox() {
  const [scan, setScan] = useState("");
  const href = whatsappHref(`Hi Jaider! I'd like a free website check for: ${scan.trim() || "my business"}`);

  return (
    <>
      <p className="scan-label">See what your website is missing</p>
      <div className="scan">
        <input
          type="text"
          value={scan}
          onChange={(e) => setScan(e.target.value)}
          placeholder="your website or business name"
          aria-label="Your website or business name"
        />
        <a href={href} target="_blank" rel="noopener">Scan</a>
      </div>
      <p className="scan-note">Free. I&apos;ll send your results on WhatsApp within 24 hours.</p>
    </>
  );
}
