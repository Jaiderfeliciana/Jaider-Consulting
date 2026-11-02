import { PageHead } from "@/components/admin/Bits";
import { isCalConfigured } from "@/lib/admin/cal";
import { isDbConfigured } from "@/lib/admin/data";

function Step({ done, title, children }: { done: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className="card setup">
      <div className="card-head">
        <h2>{title}</h2>
        <span className={`pill pill-${done ? "on" : "off"}`}>{done ? "Connected" : "Not connected"}</span>
      </div>
      {children}
    </div>
  );
}

export default function SetupPage() {
  return (
    <>
      <PageHead icon="settings" title="Setup" sub="Connect each part once. After changing settings in Vercel, redeploy for them to take effect." />
      <Step done={isDbConfigured()} title="Database — clients, earnings & visitors">
        <ol>
          <li>Open your project on <strong>vercel.com</strong> and go to the <strong>Storage</strong> tab.</li>
          <li>Click <strong>Create Database</strong>, choose <strong>Upstash → Redis</strong> (free plan), and create it.</li>
          <li>Connect it to this project. Vercel adds the settings it needs automatically.</li>
          <li>Go to <strong>Deployments</strong>, open the latest one and click <strong>Redeploy</strong>.</li>
        </ol>
      </Step>
      <Step done={isCalConfigured()} title="Cal.com — bookings">
        <ol>
          <li>In <strong>Cal.com</strong>, go to <strong>Settings → Developer → API keys</strong> and create a key (no expiry).</li>
          <li>In Vercel, open <strong>Settings → Environment Variables</strong> and add <code>CAL_API_KEY</code> with that key as the value.</li>
          <li>Redeploy (Deployments → latest → Redeploy).</li>
        </ol>
      </Step>
      <Step done title="Admin password">
        <p>Your password is the <code>ADMIN_PASSWORD</code> environment variable in Vercel. To change it, edit it there and redeploy; everyone who is logged in will be logged out.</p>
      </Step>
    </>
  );
}
