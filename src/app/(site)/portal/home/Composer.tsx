"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { sendPortalMessage } from "../actions";

// Photos from phones are often several MB: shrink large images before sending.
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export default function Composer({ uploads }: { uploads: boolean }) {
  const [state, action, pending] = useActionState(sendPortalMessage, { error: "", sent: 0 });
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const text = useRef<HTMLTextAreaElement>(null);

  // Clear the box after a message is sent.
  useEffect(() => {
    if (state.sent > 0 && text.current) { text.current.value = ""; setFiles([]); }
  }, [state.sent]);

  return (
    <form
      className="composer"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const data = new FormData();
        data.set("text", text.current?.value ?? "");
        for (const f of await Promise.all(files.map(shrink))) data.append("files", f);
        setBusy(false);
        startTransition(() => action(data));
      }}
    >
      <textarea ref={text} name="text" rows={3} placeholder="Write a message or feedback…" aria-label="Message" maxLength={4000} />
      {files.length > 0 && (
        <ul className="composer-files">
          {files.map((f, i) => (
            <li key={i}>{f.name} <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button></li>
          ))}
        </ul>
      )}
      <div className="composer-foot">
        {uploads ? (
          <label className="attach">
            + Add files
            <input type="file" multiple hidden accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt,.zip"
              onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, 5)); e.target.value = ""; }} />
          </label>
        ) : <span className="muted">File uploads coming soon</span>}
        <button type="submit" className="btn btn-primary" disabled={pending || busy}>{pending || busy ? "Sending…" : "Send"}</button>
      </div>
      <p className="form-error" role="alert">{state.error}</p>
      {state.sent > 0 && !state.error && <p className="composer-ok" role="status">Sent. Jaider has been notified.</p>}
    </form>
  );
}
