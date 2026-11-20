import ServicePageView, { servicePageMeta } from "@/components/ServicePage";

export const metadata = servicePageMeta("social-media-aruba");

export default function Page() {
  return <ServicePageView slug="social-media-aruba" />;
}
