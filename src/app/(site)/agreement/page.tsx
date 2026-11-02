import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgreementDocument from "@/components/AgreementDocument";
import AgreementForm from "./AgreementForm";
import { isDbConfigured } from "@/lib/admin/data";
import { dayKey } from "@/lib/admin/dates";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = {
  title: "Client Service Agreement — Jaider Feliciana",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// Service and price can be filled in by link: /agreement?service=Website%20design&price=1000
export default async function AgreementPage({ searchParams }: { searchParams: Promise<{ service?: string; price?: string }> }) {
  const { service, price } = await searchParams;
  const today = new Date(`${dayKey()}T12:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });
  return (
    <>
      <Header />
      <main className="section agreement-page">
        <div className="container agreement-wrap">
          <AgreementDocument />
          {isDbConfigured()
            ? <AgreementForm service={service?.slice(0, 120)} price={price?.replace(/[^0-9.,]/g, "").slice(0, 20)} today={today} />
            : (
              <div className="sign-form">
                <h2>Ready to sign?</h2>
                <p>Online signing isn&apos;t available right now. Message Jaider on WhatsApp and he&apos;ll send you the agreement.</p>
                <a href={whatsappHref("Hi Jaider! I'd like to sign the client service agreement.")} className="btn btn-primary sign-submit" target="_blank" rel="noopener">Message on WhatsApp</a>
              </div>
            )}
        </div>
      </main>
      <Footer />
    </>
  );
}
