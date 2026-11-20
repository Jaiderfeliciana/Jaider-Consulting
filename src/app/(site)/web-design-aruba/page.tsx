import ServicePageView, { servicePageMeta } from "@/components/ServicePage";

export const metadata = servicePageMeta("web-design-aruba");

export default function Page() {
  return <ServicePageView slug="web-design-aruba" />;
}
