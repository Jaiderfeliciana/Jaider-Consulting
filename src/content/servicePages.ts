// Text for the three service pages: /web-design-aruba, /logo-branding-aruba and /social-media-aruba.
// Prices are not written here: each page shows the price of its service from site.ts, so a
// price change there updates the service page too. Write {price} where the amount should appear (e.g. "$1,500").

export type ServicePage = {
  slug: string;
  // `title` of the matching service in site.ts (for its price, image and inquiry topic).
  service: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: [plain: string, highlight: string];
  lede: string;
  priceIntro: string;
  included: { title: string; text: string }[];
  forYou: string[];
  steps: { title: string; text: string }[];
  // Which package also includes this service, as a pointer to /#pricing.
  packageNote: string;
  faqs: { q: string; a: string }[];
};

export const servicePages: ServicePage[] = [
  {
    slug: "web-design-aruba",
    service: "Website design",
    navLabel: "Web design",
    metaTitle: "Web Design Aruba — Fast, Mobile-First Websites | Jaider Feliciana",
    metaDescription:
      "Web design in Aruba: fast, mobile-first websites for local businesses, with a WhatsApp button, contact form and Google setup. Fixed price from {price}. Free consultation.",
    kicker: "Web design · Aruba",
    h1: ["Web design in Aruba that brings you ", "more customers"],
    lede:
      "Most of your customers find you on their phone. I design and build fast, mobile-first websites for Aruba businesses, with a WhatsApp button and a contact form that lands straight in your inbox, so visitors turn into messages.",
    priceIntro: "A fixed price in a written quote, agreed before any work starts. No surprises afterwards.",
    included: [
      { title: "Mobile-first design", text: "Designed for phones first, then tablet and desktop. Every page is checked on real screen sizes." },
      { title: "WhatsApp button", text: "One tap from any page opens a WhatsApp chat with you, the way most people in Aruba prefer to reach a business." },
      { title: "Contact form", text: "Inquiries land straight in your inbox, with the details you need to reply." },
      { title: "Fast loading", text: "Optimised images and clean code, so the site opens quickly, even on mobile data." },
      { title: "Google-ready", text: "Page titles, descriptions and share previews set up, so you show up properly on Google and when your link is shared." },
      { title: "Two rounds of changes", text: "You see the design before launch and get two rounds of changes included." },
    ],
    forYou: [
      "You don't have a website yet, or only a Facebook or Instagram page",
      "Your current website looks outdated or doesn't work well on phones",
      "Customers keep asking for the same information (prices, hours, location)",
      "You want people to contact you on WhatsApp straight from Google",
    ],
    steps: [
      { title: "Free consultation", text: "We talk about your business, your customers and what the website has to do for you." },
      { title: "Quote & plan", text: "You get a written quote with a fixed price, the pages, and a timeline." },
      { title: "Design & build", text: "I design the site, you review it, and we make two rounds of changes." },
      { title: "Launch", text: "Your site goes live on your domain, connected to WhatsApp, your email and Google." },
    ],
    packageNote: "Want a logo, Google setup and a consultation too? The Basic, Standard and Pro packages include a website plus more.",
    faqs: [
      { q: "How much does a website cost in Aruba?", a: "My websites start at {price}. The final price depends on the number of pages and features (for example a blog or a webshop). You get a fixed price in a written quote after a free consultation." },
      { q: "How long does it take?", a: "It depends on the size of the site and how quickly the content (texts, photos) is ready. You get a timeline in your quote before we start." },
      { q: "How does payment work?", a: "A 50% deposit before the work starts, and the rest before launch." },
      { q: "Is there a monthly cost?", a: "A website needs hosting. I can take care of hosting, backups, security updates and small changes with the Website care plan; see the Basic package for what it includes. Monthly plans run month to month and can be cancelled with 30 days' notice." },
      { q: "Will I own my website?", a: "Yes. After full payment you receive the agreed rights to the final website. Third-party software, fonts and licensed images stay under their own licenses." },
      { q: "Can you guarantee I'll be first on Google?", a: "No one can honestly guarantee Google rankings. I build your site the way Google likes (fast, mobile-friendly, clear titles) and can set up your Google Business Profile, which helps local customers find you." },
    ],
  },
  {
    slug: "logo-branding-aruba",
    service: "Branding & logo",
    navLabel: "Logo & branding",
    metaTitle: "Logo & Branding Aruba — Logo Design and Brand Guide | Jaider Feliciana",
    metaDescription:
      "Logo design and branding in Aruba: a logo, colours, fonts and a short brand guide so your business looks like one brand everywhere. From {price}. Free consultation.",
    kicker: "Logo & branding · Aruba",
    h1: ["Logo & branding in Aruba that ", "people remember"],
    lede:
      "Your logo is often the first thing a customer sees: on your sign, your Instagram, your invoices. I design logos and brand identities for Aruba businesses, with colours, fonts and a short brand guide, so everything looks like one professional brand.",
    priceIntro: "A fixed price in a written quote, based on what your brand needs: a logo only, or a full identity.",
    included: [
      { title: "Logo design", text: "A logo made for your business, in versions for light and dark backgrounds and for small spaces like a profile picture." },
      { title: "Colour palette", text: "Your brand colours with the exact codes, so your printer, designer and website all use the same ones." },
      { title: "Typography", text: "The fonts for headings and text, chosen to match your style and easy to read." },
      { title: "Short brand guide", text: "One clear document showing how to use your logo, colours and fonts, so your brand stays consistent." },
      { title: "Files for everything", text: "Your logo in the formats you need for print, signs, social media and your website." },
      { title: "Two rounds of changes", text: "You see the concept and get two rounds of changes included." },
    ],
    forYou: [
      "You're starting a new business and need a logo",
      "Your current logo looks dated, or was made quickly",
      "Your Instagram, sign and flyers all look different",
      "You want to look as professional as the bigger businesses",
    ],
    steps: [
      { title: "Free consultation", text: "We talk about your business, your customers and the feeling your brand should give." },
      { title: "Quote & direction", text: "You get a written quote and we agree on the style direction." },
      { title: "Design & refine", text: "I present the logo and brand, and we refine it with two rounds of changes." },
      { title: "Hand-over", text: "You get all logo files and your brand guide, ready to use." },
    ],
    packageNote: "Building a website too? Every package includes branding: a simple logo in Basic, a logo + brand guide in Standard, full branding in Pro.",
    faqs: [
      { q: "How much does a logo cost in Aruba?", a: "Branding starts at {price}. A logo on its own costs less than a full identity with colours, fonts and a brand guide. You get a fixed price in a written quote after a free consultation." },
      { q: "What files do I get?", a: "Your logo in the formats you need for print, signs, social media and your website, plus your brand guide." },
      { q: "Will I own my logo?", a: "Yes. After full payment you receive the agreed rights to the final logo and brand. Licensed fonts stay under their own licenses." },
      { q: "Can you update my existing logo?", a: "Yes. Sometimes a refresh of your current logo is better than starting over, especially if customers already know it. We decide together in the consultation." },
      { q: "How does payment work?", a: "A 50% deposit before the work starts, and the rest before the final files are delivered." },
    ],
  },
  {
    slug: "social-media-aruba",
    service: "Social media marketing",
    navLabel: "Social media",
    metaTitle: "Social Media Marketing Aruba — Instagram, Facebook & TikTok | Jaider Feliciana",
    metaDescription:
      "Social media marketing in Aruba: content for Instagram, Facebook and TikTok with a monthly plan, designed and scheduled for you. {price} per month. Free consultation.",
    kicker: "Social media · Aruba",
    h1: ["Social media marketing in Aruba, ", "done for you"],
    lede:
      "Posting when you have time doesn't build a following. I plan, design and schedule content for your Instagram, Facebook and TikTok every month, so your business shows up consistently and customers know where to find you.",
    priceIntro: "One fixed monthly price. Month to month: cancel any time with 30 days' notice.",
    included: [
      { title: "Monthly content plan", text: "Every month starts with a plan: what we post, when, and why. No more random posting." },
      { title: "Designed posts & stories", text: "Posts and stories in your brand style, written and designed for you." },
      { title: "Scheduling", text: "Everything is scheduled at the times your customers are online." },
      { title: "Instagram, Facebook & TikTok", text: "Content made for each platform, not one post copied everywhere." },
      { title: "Monthly report", text: "A short report on what worked, what didn't, and what's next." },
      { title: "WhatsApp contact", text: "Quick questions or a last-minute promotion? Message me on WhatsApp." },
    ],
    forYou: [
      "You know you should post more, but there's never time",
      "Your page has gone quiet, or only posts once in a while",
      "Your posts don't look professional or don't match your brand",
      "You want more people to message you from Instagram and Facebook",
    ],
    steps: [
      { title: "Free consultation", text: "We look at your current pages, your customers and your goals." },
      { title: "Profile setup", text: "Your profiles are cleaned up: bio, highlights, links and contact buttons." },
      { title: "Monthly plan", text: "Each month you approve the content plan before anything is posted." },
      { title: "Post, measure, improve", text: "Content goes out on schedule, and every month we look at the numbers and improve." },
    ],
    packageNote: "Need a website too? The Standard package combines website care with social media (12 posts + 8 stories a month).",
    faqs: [
      { q: "How much does social media management cost in Aruba?", a: "{price} per month for content planning, design and scheduling on your platforms. The exact number of posts is agreed in your plan. As a guide, the Standard package includes 12 posts and 8 stories a month." },
      { q: "Is there a contract?", a: "Monthly plans start after setup, are paid in advance and run month to month: cancel any time with 30 days' notice." },
      { q: "Do I need to provide photos?", a: "Your own photos of your business, products and team work best, and I'll tell you what to shoot. Where needed, I use licensed stock images and designed graphics." },
      { q: "Do I approve the posts?", a: "Yes. You approve the monthly plan before anything is posted." },
      { q: "Are ads included?", a: "No. Paid ads are a separate service (Meta & Google Ads), with your ad budget paid directly to Meta or Google. Many businesses combine the two." },
      { q: "Can you guarantee more followers or sales?", a: "No one can honestly guarantee that. What I do guarantee is consistent, professional content, and a monthly report so you can see what's working." },
    ],
  },
];

export const servicePageFor = (serviceTitle: string) => servicePages.find((p) => p.service === serviceTitle);
