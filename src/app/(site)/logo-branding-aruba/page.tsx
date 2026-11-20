import ServicePageView, { servicePageMeta } from "@/components/ServicePage";

export const metadata = servicePageMeta("logo-branding-aruba");

export default function Page() {
  return <ServicePageView slug="logo-branding-aruba" />;
}
