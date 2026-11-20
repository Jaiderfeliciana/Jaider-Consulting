import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Photos from "@/components/Photos";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Course from "@/components/Course";
import Pricing from "@/components/Pricing";
import Process from "@/components/Process";
import CtaBanner from "@/components/CtaBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { showPricing } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Jaider Feliciana — Websites, Social Media & Ads in Aruba",
  description:
    "Fast, professional websites, social media marketing, Meta & Google Ads, branding and SEO for Aruba businesses. Book a free consultation.",
  path: "/",
  shareTitle: "Jaider Feliciana — Websites that bring you more customers",
  shareDescription: "Websites, social media and ads for Aruba businesses. Free consultation on WhatsApp.",
});

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Photos />
        <Stats />
        <Services />
        <Course />
        {showPricing && <Pricing />}
        <Process />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
