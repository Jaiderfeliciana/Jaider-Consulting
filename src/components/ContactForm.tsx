"use client";

import { useState, type FormEvent } from "react";
import { contactTopics, whatsappHref } from "@/content/site";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState("");
  const [social, setSocial] = useState("");
  const [topic, setTopic] = useState(contactTopics[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentName, setSentName] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter your name.");
    if (!contact.trim()) return setError("I need a WhatsApp number or email to reply.");
    setSentName(name.trim().split(" ")[0]);
  }

  function reset() {
    setSentName(null);
    setName("");
    setContact("");
    setWebsite("");
    setSocial("");
    setMessage("");
    setError("");
  }

  if (sentName !== null) {
    const prefill = [
      `Hi Jaider! My name is ${sentName}. I'm interested in: ${topic}.`,
      message.trim(),
      website.trim() && `My website: ${website.trim()}`,
      social.trim() && `My social media: ${social.trim()}`,
      `You can reach me at ${contact.trim()}.`,
    ].filter(Boolean).join("\n");
    return (
      <div className="sent">
        <h3>Thanks, {sentName}!</h3>
        <p>Your message is ready. Tap the button to send it straight to me on WhatsApp.</p>
        <a href={whatsappHref(prefill)} target="_blank" rel="noopener" className="btn btn-primary">Open WhatsApp</a>
        <button type="button" onClick={reset} className="link-button">send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form" noValidate>
      <label>
        Your name
        <input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Full name" autoComplete="name" />
      </label>
      <label>
        WhatsApp or email
        <input value={contact} onChange={(e) => { setContact(e.target.value); setError(""); }} placeholder="+297 ... or name@email.com" />
      </label>
      <label>
        <span>Your website <span className="optional">(optional)</span></span>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourbusiness.com" inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck={false} />
      </label>
      <label>
        <span>Your social media profile <span className="optional">(optional)</span></span>
        <input value={social} onChange={(e) => setSocial(e.target.value)} placeholder="@yourbusiness or profile link" autoCapitalize="none" spellCheck={false} />
      </label>
      <p className="form-hint">Share your website or socials and I&apos;ll review them before we talk, so I come with ideas that fit your business.</p>
      <label>
        What do you need?
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          {contactTopics.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>
        Tell me a bit more
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="What does your business do, and what do you want to achieve?" />
      </label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit" className="form-submit">Send &amp; book my free consultation</button>
      <p className="form-foot">no obligation · reply within 24 hours</p>
    </form>
  );
}
