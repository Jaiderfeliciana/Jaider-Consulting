import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { addPayment, removePayment } from "@/app/admin/actions";
import { getClients, getPayments, paymentMethods, type Payment } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { dayKey, monthKey, money, shortDate } from "@/lib/admin/dates";

export default async function EarningsPage() {
  const [payments, clients] = await Promise.all([fromDb(getPayments), fromDb(getClients)]);
  if (!("data" in payments)) {
    return <><PageHead icon="dollar" title="Finance & Payments" /><NotConnected what="The database" error={"error" in payments ? payments.error : undefined} /></>;
  }
  const list = payments.data;
  const month = monthKey(), year = month.slice(0, 4);
  const sum = (prefix: string, method?: Payment["method"]) =>
    list.filter((p) => p.date.startsWith(prefix) && (!method || p.method === method)).reduce((s, p) => s + p.amount, 0);
  const split = (prefix: string) => `Transfer ${money(sum(prefix, "transfer"))} · Cash ${money(sum(prefix, "cash"))}`;
  const names = "data" in clients ? clients.data.map((c) => c.business ? `${c.name} — ${c.business}` : c.name) : [];

  return (
    <>
      <PageHead icon="dollar" title="Finance & Payments" sub="Record every payment you receive; the overview adds them up." />
      <section className="stats-row stats-3">
        <Stat dark label="This month" value={money(sum(month))} note={split(month)} />
        <Stat label="This year" value={money(sum(year))} note={split(year)} />
        <Stat label="All time" value={money(list.reduce((s, p) => s + p.amount, 0))} note={`${list.length} payment${list.length === 1 ? "" : "s"}`} />
      </section>

      <div className="card">
        <h2>Add a payment</h2>
        <form action={addPayment} className="a-form a-form-pay">
          <label>Client
            <input name="client" list="client-names" placeholder="Maria Croes" />
            <datalist id="client-names">{names.map((n) => <option key={n} value={n} />)}</datalist>
          </label>
          <label>What for<input name="description" placeholder="Website design — deposit" /></label>
          <label>Amount (USD)<input name="amount" inputMode="decimal" required placeholder="500" /></label>
          <label>Date<input name="date" type="date" defaultValue={dayKey()} required /></label>
          <label>Paid by
            <select name="method" defaultValue="transfer" required>
              {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>
          <button type="submit" className="a-btn a-btn-primary">Add payment</button>
        </form>
      </div>

      <div className="card">
        <h2>Payments</h2>
        {list.length === 0 ? <p className="muted">No payments yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Date</th><th>Client</th><th>What for</th><th>Paid by</th><th className="num">Amount</th><th /></tr></thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id}>
                    <td>{shortDate(p.date)} {p.date.slice(0, 4)}</td>
                    <td>{p.client || "—"}</td>
                    <td>{p.description || "—"}</td>
                    <td>{p.method ? <span className={`pill pill-${p.method}`}>{p.method === "cash" ? "Cash" : "Transfer"}</span> : "—"}</td>
                    <td className="num">{money(p.amount)}</td>
                    <td className="num">
                      <form action={removePayment}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`Delete the payment of ${money(p.amount)}?`}>Delete</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
