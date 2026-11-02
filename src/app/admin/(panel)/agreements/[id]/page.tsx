import { notFound } from "next/navigation";
import AgreementDocument from "@/components/AgreementDocument";
import PrintButton from "@/components/PrintButton";
import CountersignForm from "@/components/admin/CountersignForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { PageHead } from "@/components/admin/Bits";
import { removeAgreement } from "@/app/admin/actions";
import { getAgreement, isDbConfigured } from "@/lib/admin/data";

export default async function AgreementView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) notFound();
  const found = await getAgreement(id);
  if (!found) notFound();
  const { agreement: a, signatures } = found;
  return (
    <>
      <PageHead icon="folder" title={a.fullName} sub={`${a.service} · USD $${a.price}`} action={
        <div className="view-actions">
          <PrintButton className="a-btn a-btn-ghost" />
          <a className="a-btn a-btn-ghost" href={`/agreement/signed/${a.id}`} target="_blank" rel="noopener">Client&apos;s copy ↗</a>
        </div>
      } />
      {!a.provider && (
        <div className="card no-print">
          <h2>Countersign</h2>
          <p className="muted">Sign below to complete the agreement. The client&apos;s copy updates automatically.</p>
          <CountersignForm id={a.id} />
        </div>
      )}
      <AgreementDocument signed={a} signatures={signatures} />
      <div className="card no-print record">
        <h2>Signing record</h2>
        <p className="muted">Signed from IP address {a.ip} using {a.userAgent || "an unknown browser"}. Terms version {a.version}.</p>
        <form action={removeAgreement}>
          <input type="hidden" name="id" value={a.id} />
          <ConfirmButton message={`Delete the agreement with ${a.fullName}? This can't be undone.`}>Delete agreement</ConfirmButton>
        </form>
      </div>
    </>
  );
}
