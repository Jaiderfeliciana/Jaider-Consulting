import type { ReactNode } from "react";
import ContactForm from "./ContactForm";
import { contact, phoneDisplay, telHref, whatsappHref } from "@/content/site";

const icon = (children: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const channels = [
  {
    label: "WhatsApp", value: phoneDisplay, href: whatsappHref(), external: true,
    icon: icon(<>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9.2 8.6c.2-.4.5-.4.8-.4l.6 1.4c.1.2 0 .4-.1.6l-.4.5c.5 1 1.3 1.8 2.3 2.3l.5-.4c.2-.1.4-.2.6-.1l1.4.6c0 .3 0 .6-.4.8-.8.6-1.8.6-3-.1-1.2-.7-2.2-1.7-2.7-2.9-.4-1-.2-1.8.4-2.3z" fill="#fff" stroke="none" />
    </>),
  },
  {
    label: "Call", value: phoneDisplay, href: telHref,
    icon: icon(<path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />),
  },
  {
    label: "Email", value: contact.email, href: `mailto:${contact.email}`,
    icon: icon(<><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M4 7l8 6 8-6" /></>),
  },
  {
    label: "Instagram", value: contact.instagram.handle, href: contact.instagram.url, external: true,
    icon: icon(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none" /></>),
  },
  {
    label: "Facebook", value: contact.facebook.handle, href: contact.facebook.url, external: true,
    icon: icon(<path d="M14.5 21v-7.5h2.6l.4-3h-3V8.7c0-.9.3-1.5 1.6-1.5H18V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.1H9.2v3h2.6V21" />),
  },
  {
    label: "TikTok", value: contact.tiktok.handle, href: contact.tiktok.url, external: true,
    icon: icon(<><path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3.5c.4 2.4 2 4 4.5 4.3" /></>),
  },
];

export default function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container split">
        <div>
          <p className="eyebrow" style={{ marginBottom: 20 }}>05 / Contact</p>
          <h2 className="h2 contact-title">Let&apos;s talk. The consultation is free.</h2>
          <p className="contact-lede">
            Tell me what your business does and what you want to achieve. I&apos;ll reply within 24 hours with a
            concrete idea — no obligation.
          </p>
          <div className="channels">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="channel"
                {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
              >
                <span className="channel-icon">{c.icon}</span>
                <span className="channel-text">
                  <span className="channel-label">{c.label}</span>
                  <span className="channel-value">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
          <p className="contact-hours">{contact.location}</p>
        </div>
        <div className="form-card">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
