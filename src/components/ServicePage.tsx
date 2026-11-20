import Image from "next/image";
import type { Metadata } from "next";
import Header from "./Header";
import Footer from "./Footer";
import Contact from "./Contact";
import { contact, services, type Service } from "@/content/site";
import { servicePages, type ServicePage } from "@/content/servicePages";
import { pageMeta, siteUrl } from "@/lib/seo";

const serviceOf = (page: ServicePage): Service => {
  const s = services.find((x) => x.title === page.service);
  if (!s) throw new Error(`No service called "${page.service}" in site.ts`);
  return s;
};

// "From $1,500" → "$1,500"
const amountOf = (s: Service) => s.price.match(/\$[\d,.]+/)?.[0] ?? s.price;
const fill = (text: string, s: Service) => text.replaceAll("{price}", amountOf(s));

export const pageBySlug = (slug: string) => {
  const page = servicePages.find((p) => p.slug === slug);
  if (!page) throw new Error(`No service page "${slug}"`);
  return page;
};

export function servicePageMeta(slug: string): Metadata {
  const page = pageBySlug(slug);
  const s = serviceOf(page);
  return pageMeta({
    title: page.metaTitle,
    description: fill(page.metaDescription, s),
    path: `/${page.slug}`,
    shareTitle: `${page.h1[0]}${page.h1[1]}`,
  });
}

// Structured data so Google understands the service, its price, the FAQ and where the page sits.
function jsonLd(page: ServicePage, s: Service) {
  const url = `${siteUrl}/${page.slug}`;
  const amount = Number(amountOf(s).replace(/[^0-9.]/g, ""));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.h1.join("").replace(/,\s*$/, ""),
      serviceType: page.service,
      url,
      description: fill(page.metaDescription, s),
      areaServed: { "@type": "Country", name: "Aruba" },
      provider: {
        "@type": "ProfessionalService",
        name: "Jaider Feliciana",
        url: siteUrl,
        telephone: contact.whatsapp,
        address: { "@type": "PostalAddress", addressLocality: "Oranjestad", addressCountry: "AW" },
      },
      ...(amount
        ? {
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              ...(s.priceNote?.includes("month")
                ? { priceSpecification: { "@type": "UnitPriceSpecification", price: amount, priceCurrency: "USD", unitCode: "MON" } }
                : { price: amount }),
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: fill(f.a, s) } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/#services` },
        { "@type": "ListItem", position: 3, name: page.navLabel, item: url },
      ],
    },
  ];
}

export default function ServicePageView({ slug }: { slug: string }) {
  const page = pageBySlug(slug);
  const s = serviceOf(page);
  const others = servicePages.filter((p) => p.slug !== page.slug);

  return (
    <>
      <Header />
      <main className="svc">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(page, s)).replace(/</g, "\\u003c") }} />

        <section className="section svc-hero">
          <div className="container svc-hero-grid">
            <div className="svc-hero-copy">
              <nav aria-label="Breadcrumb" className="svc-crumbs">
                <a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/#services">Services</a> <span aria-hidden="true">/</span> <span aria-current="page">{page.navLabel}</span>
              </nav>
              <p className="hero-kicker"><span />{page.kicker}</p>
              <h1>{page.h1[0]}<span className="gradient-text">{page.h1[1]}</span>.</h1>
              <p className="svc-lede">{page.lede}</p>
              <p className="svc-price">{s.price}{s.priceNote && <span> {s.priceNote}</span>}</p>
              <div className="hero-ctas">
                <a href="/book" className="btn btn-primary">Book a free consultation</a>
                <a href="#contact" className="btn btn-ghost">Get a quote ↘</a>
              </div>
            </div>
            <div className="svc-hero-img">
              <Image src={s.image} alt={s.imageAlt} priority sizes="(max-width: 900px) 100vw, 560px" />
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2 className="h2">What you get.</h2>
              <p className="eyebrow">01 / Included</p>
            </div>
            <div className="svc-included">
              {page.included.map((item, i) => (
                <div key={item.title} className="svc-item">
                  <p className="step-num">{String(i + 1).padStart(2, "0")}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>02 / Is this for you?</p>
              <h2 className="h2 svc-h2">This is for you if…</h2>
              <ul className="svc-checks">
                {page.forYou.map((t) => <li key={t}><span className="chip-check" aria-hidden="true">✓</span>{t}</li>)}
              </ul>
            </div>
            <div className="svc-price-card">
              <p className="package-tier">Price</p>
              <p className="package-price">{s.price}</p>
              {s.priceNote && <p className="package-once">{s.priceNote}</p>}
              <p className="svc-price-intro">{page.priceIntro}</p>
              <a href="#contact" className="btn btn-primary">Get your quote</a>
              <p className="svc-price-note">{page.packageNote} <a href="/#pricing">See packages →</a></p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: "clamp(26px,4vw,48px)" }}>03 / How it works</p>
            <div className="process-grid">
              {page.steps.map((st, i) => (
                <div key={st.title} className="step">
                  <p className="step-num">{String(i + 1).padStart(2, "0")}</p>
                  <h3>{st.title}</h3>
                  <p>{st.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container svc-faq-wrap">
            <div>
              <p className="eyebrow" style={{ marginBottom: 20 }}>04 / Questions</p>
              <h2 className="h2 svc-h2">Frequently asked.</h2>
            </div>
            <div className="svc-faq">
              {page.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{fill(f.a, s)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <Contact topic={s.topic} eyebrow="05 / Contact" />

        <section className="section svc-more">
          <div className="container">
            <p className="eyebrow" style={{ marginBottom: 20 }}>More services</p>
            <div className="svc-more-links">
              {others.map((p) => (
                <a key={p.slug} href={`/${p.slug}`} className="svc-more-link">
                  <span>{p.navLabel} in Aruba</span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
              <a href="/#services" className="svc-more-link"><span>All services</span><span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
