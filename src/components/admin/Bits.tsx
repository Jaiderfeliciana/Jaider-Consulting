import Link from "next/link";
import Icon from "./Icon";

export function PageHead({ title, sub, action, icon = "chart" }: { title: string; sub?: string; action?: React.ReactNode; icon?: string }) {
  return (
    <header className="page-head">
      <span className="page-icon"><Icon name={icon} size={26} /></span>
      <div className="page-title">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}

// Shown in place of a section whose data source isn't connected yet.
export function NotConnected({ what, error }: { what: string; error?: string }) {
  return (
    <div className="not-connected">
      <p><strong>{error ? `${what}: something went wrong` : `${what} isn't connected yet`}</strong></p>
      <p>{error ?? "Follow the steps on the Setup page to switch it on."}</p>
      <Link href="/admin/setup" className="a-btn a-btn-ghost">Open setup</Link>
    </div>
  );
}

export function Stat({ label, value, note, dark }: { label: string; value: string; note?: string; dark?: boolean }) {
  return (
    <div className={dark ? "stat stat-dark" : "stat"}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {note && <p className="stat-note">{note}</p>}
    </div>
  );
}
