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
