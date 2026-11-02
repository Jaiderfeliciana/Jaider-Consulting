"use client";

import { useEffect, useRef, useState } from "react";

// Draw-to-sign box. Puts the signature (a PNG data URL) into a hidden input named `name`.
export default function SignaturePad({ name, label }: { name: string; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    const cv = canvas.current!;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      const ctx = cv.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#12111a";
      setValue("");
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  return (
    <div className="sig">
      <span className="sig-label">{label}</span>
      <canvas
        ref={canvas}
        className="sig-canvas"
        aria-label={`${label}: draw your signature with your finger or mouse`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const ctx = e.currentTarget.getContext("2d")!;
          const [x, y] = point(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 0.1, y + 0.1);
          ctx.stroke();
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d")!;
          const [x, y] = point(e);
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          setValue(e.currentTarget.toDataURL("image/png"));
        }}
        onPointerCancel={() => (drawing.current = false)}
      />
      <div className="sig-foot">
        <span>{value ? "Signed ✓" : "Sign inside the box"}</span>
        <button
          type="button"
          onClick={() => {
            const cv = canvas.current!;
            cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height);
            setValue("");
          }}
        >
          Clear
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
