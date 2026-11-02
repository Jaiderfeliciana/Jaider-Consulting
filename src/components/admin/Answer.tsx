// Shows an assistant answer: keeps line breaks and turns **text** into bold, without injecting HTML.
export default function Answer({ text }: { text: string }) {
  return (
    <div className="answer">
      {text.split("\n").map((line, i) => (
        <p key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part.replace(/^#+\s*/, ""))}
        </p>
      ))}
    </div>
  );
}
