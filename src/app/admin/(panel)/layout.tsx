import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="panel">
      <Sidebar />
      <div className="panel-body">
        <Topbar />
        <main className="panel-main">{children}</main>
      </div>
    </div>
  );
}
