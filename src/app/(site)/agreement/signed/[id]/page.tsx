import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgreementDocument from "@/components/AgreementDocument";
import PrintButton from "@/components/PrintButton";
import { getAgreement, isDbConfigured } from "@/lib/admin/data";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = { title: "Signed agreement — Jaider Feliciana", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The client's copy. The link contains a long random id, so only people with the link can open it.
export default async function SignedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured() || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const found = await getAgreement(id);
  if (!found) notFound();
  const { agreement, signatures } = found;
  return (
    <>
      <Header />
      <main className="section agreement-page">
        <div className="container agreement-wrap">
          <div className="signed-banner no-print">
            <p className="eyebrow">Thank you, {agreement.fullName.split(" ")[0]}!</p>
            <h2>Your agreement is signed.</h2>
            <p>Jaider will countersign it and get started. Save a copy for your records; bookmark this page to see Jaider&apos;s signature later.</p>
            <div className="signed-actions">
              <PrintButton />
              <a className="btn btn-ghost" href={whatsappHref(`Hi Jaider! I just signed the agreement for ${agreement.service} (ref. ${agreement.id.slice(0, 8).toUpperCase()}).`)} target="_blank" rel="noopener">Tell Jaider on WhatsApp</a>
            </div>
          </div>
          <AgreementDocument signed={agreement} signatures={signatures} />
        </div>
      </main>
      <Footer />
    </>
  );
}
