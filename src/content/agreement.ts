// The client service agreement shown on /agreement.
// When you change the terms, also change `version`: every signed agreement keeps the version it was signed under.

export const agreement = {
  version: "2026-11",
  title: "Client Service Agreement",
  intro:
    'This agreement establishes the terms between Jaider Feliciana ("Service Provider") and the client ("Client") for the requested services.',
  sections: [
    {
      title: "Services",
      text: "The Service Provider agrees to deliver the services selected and approved by the Client, including website development, social media marketing, Meta & Google Ads, branding, SEO and AI automation.",
    },
    {
      title: "Payment",
      bullets: [
        "A 50% deposit is required before starting projects, unless otherwise agreed.",
        "The remaining balance is due before final delivery or launch.",
        "Monthly services must be paid in advance.",
        "Additional services and third-party expenses may incur extra charges with client approval.",
      ],
    },
    {
      title: "Revisions & Approval",
      text: "The Client receives the revisions included in their selected package. Additional changes or requests outside the original project scope may require additional payment.",
    },
    {
      title: "Cancellations & Refunds",
      text: "Cancellations must be submitted in writing. Charges for completed work and approved expenses may apply. Eligible refunds will be handled according to applicable law and the agreed service terms.",
    },
    {
      title: "Ownership",
      text: "Upon full payment, the Client receives the agreed rights to the final deliverables. Third-party software, plugins, fonts and licensed materials remain subject to their respective licenses.",
    },
    {
      title: "Results & Guarantees",
      text: "Jaider Feliciana provides professional digital services but does not guarantee specific sales, website traffic, advertising results, Google rankings or business growth.",
    },
    {
      title: "Client Responsibilities",
      text: "The Client agrees to provide accurate information, necessary materials, timely feedback and payments. The Client must have permission to use all materials supplied.",
    },
    {
      title: "Privacy & Confidentiality",
      text: "Both parties agree to protect confidential information and handle personal data responsibly in accordance with applicable laws.",
    },
    {
      title: "Agreement",
      text: "By signing below, the Client confirms that they have read, understood and accepted these terms and the approved project quotation.",
    },
  ] as { title: string; text?: string; bullets?: string[] }[],
  law: "This agreement is subject to applicable laws of Aruba and any mandatory legal protections.",
  tagline: "Your Success Is Online.",
};
