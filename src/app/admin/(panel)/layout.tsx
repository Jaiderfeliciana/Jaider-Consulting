import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="panel">
      <Topbar />
      <Sidebar />
      <main className="panel-main">{children}</main>
    </div>
  );
}
