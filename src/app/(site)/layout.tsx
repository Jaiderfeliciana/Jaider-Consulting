import WhatsAppFloat from "@/components/WhatsAppFloat";
import VisitTracker from "@/components/VisitTracker";

// Public website pages: everything except the admin panel.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WhatsAppFloat />
      <VisitTracker />
    </>
  );
}
