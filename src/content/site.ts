// All editable website content lives here: contact details, services, prices and course info.

import type { StaticImageData } from "next/image";
import webImg from "@/assets/services/web.png";
import socialImg from "@/assets/services/social.png";
import adsImg from "@/assets/services/ads.png";
import brandImg from "@/assets/services/brand.png";
import seoImg from "@/assets/services/seo.png";
import consultImg from "@/assets/services/consult.png";
import courseImg from "@/assets/services/course.png";

export const contact = {
  whatsapp: "+2975600770",
  email: "jaiderfeliciana@gmail.com",
  instagram: { handle: "@felicianajaider", url: "https://www.instagram.com/felicianajaider/" },
  facebook: { handle: "Jaider Feliciana", url: "https://www.facebook.com/search/top?q=Jaider%20Feliciana" },
  tiktok: { handle: "@felicianajaider", url: "https://www.tiktok.com/@felicianajaider" },
  location: "Oranjestad, Aruba · Mon–Fri 9:00–18:00",
};

const phoneDigits = contact.whatsapp.replace(/[^0-9]/g, "");

export const phoneDisplay =
  phoneDigits.length === 10
    ? `+${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 6)} ${phoneDigits.slice(6)}`
    : contact.whatsapp;

export const telHref = `tel:+${phoneDigits}`;

export function whatsappHref(text?: string) {
  return `https://wa.me/${phoneDigits}` + (text ? `?text=${encodeURIComponent(text)}` : "");
}

export const course = {
  spotsLeft: 8,
  price: "$219",
  installments: "or 2 payments of $115",
  format: "4 weeks · online · live",
  details: "2 sessions a week · recordings are yours to keep · WhatsApp group",
  modules: [
    "Foundations: who you're talking to and what you sell",
    "Build your website from A to Z",
    "Content for Instagram, Facebook and TikTok",
    "Ads, Google and measuring your results",
  ],
};

export const showPricing = true;

export const stats = [
  { value: "14 days", label: "To get your site live" },
  { value: "7", label: "Services under one roof" },
  { value: "100%", label: "Built mobile-first" },
  { value: "24h", label: "WhatsApp reply time" },
];

export type Service = {
  title: string;
  description: string;
  price: string;
  priceNote?: string;
  image: StaticImageData;
  imageAlt: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    title: "Website design",
    description: "Fast, mobile-first websites with a WhatsApp button and a contact form that lands straight in your inbox.",
    price: "From $795",
    image: webImg,
    imageAlt: "Website design mockup on laptop and phone",
  },
  {
    title: "Social media marketing",
    description: "Content for Instagram, Facebook and TikTok with a monthly plan — no more random posting.",
    price: "$475",
    priceNote: "per month",
    image: socialImg,
    imageAlt: "Social media post on a phone with app icons",
  },
  {
    title: "Meta & Google Ads",
    description: "Campaigns with a clear budget, the right audience and reports you can actually understand.",
    price: "$295",
    priceNote: "per month + 15% of ad spend",
    image: adsImg,
    imageAlt: "Ads dashboard on a laptop with Meta and Google Ads",
  },
  {
    title: "Branding & logo",
    description: "Logo, colours, typography and a short brand guide so everything looks like one brand.",
    price: "From $650",
    image: brandImg,
    imageAlt: "Black and gold brand stationery",
  },
  {
    title: "SEO & Google",
    description: "Google Business Profile, local keywords and speed — so people in Aruba find you first.",
    price: "$395",
    priceNote: "setup · $150 per month",
    image: seoImg,
    imageAlt: "Google search on a laptop",
  },
  {
    title: "1-on-1 consultation",
    description: "One hour with me: we look at your business and you leave with a written, step-by-step plan.",
    price: "$95",
    priceNote: "per hour",
    image: consultImg,
    imageAlt: "Video consultation on a laptop",
  },
  {
    title: "Online course",
    description: "Learn to build your own website and run your own social media marketing.",
    price: "$219",
    priceNote: "full course",
    image: courseImg,
    imageAlt: "Online course modules on a laptop",
    featured: true,
  },
];

export type Package = {
  tier: string;
  name: string;
  price: string;
  monthly: string;
  monthlyNote: string;
  features: [label: string, value: string | null][];
  popular?: boolean;
};

export const packages: Package[] = [
  {
    tier: "Basic",
    name: "Basic package",
    price: "$795",
    monthly: "$79",
    monthlyNote: "per month — hosting, backups, updates",
    features: [
      ["Website design", "1 page"],
      ["Social media marketing", null],
      ["Meta & Google Ads", null],
      ["Branding & logo", "Simple logo"],
      ["SEO & Google", "Google Business Profile"],
      ["1-on-1 consultation", "1 session"],
      ["Online course", null],
    ],
  },
  {
    tier: "Standard",
    name: "Standard package",
    price: "$1,595",
    monthly: "$475",
    monthlyNote: "per month — content and maintenance",
    popular: true,
    features: [
      ["Website design", "Up to 6 pages + blog"],
      ["Social media marketing", "12 post + 8 story"],
      ["Meta & Google Ads", "Campaign setup"],
      ["Branding & logo", "Logo + brand guide"],
      ["SEO & Google", "Full local SEO"],
      ["1-on-1 consultation", "1 per month"],
      ["Online course", "1 seat included"],
    ],
  },
  {
    tier: "Pro",
    name: "Pro package",
    price: "$2,950",
    monthly: "$1,095",
    monthlyNote: "per month — all services, priority support",
    features: [
      ["Website design", "Unlimited + webshop"],
      ["Social media marketing", "20 post + 12 story + reels"],
      ["Meta & Google Ads", "Managed + 15% ad spend"],
      ["Branding & logo", "Full branding"],
      ["SEO & Google", "SEO + monthly report"],
      ["1-on-1 consultation", "Unlimited"],
      ["Online course", "2 seats included"],
    ],
  },
];

export const processSteps = [
  { title: "Free consultation", text: "30 minutes on WhatsApp or in person. I listen to what your business really needs." },
  { title: "Plan & quote", text: "You get a written quote with a fixed price, timeline and exactly what's included." },
  { title: "Build & review", text: "You see the design before launch. Two rounds of changes included." },
  { title: "Launch & grow", text: "We go live, measure what works and keep improving every month." },
];

export const contactTopics = [
  "Website design",
  "Social media marketing",
  "Ads (Meta / Google)",
  "Branding or logo",
  "SEO / Google",
  "1-on-1 consultation",
  "Online course",
];
