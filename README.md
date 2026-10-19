# Jaider Feliciana — Website

Website for Jaider Feliciana's web design, social media and ads services in Aruba.
Built with [Next.js](https://nextjs.org) and exported as a static site to GitHub Pages.

## Run it locally

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Editing content

Almost everything you'd want to change is in **`src/content/site.ts`**:

- WhatsApp number, email and social links
- Services, their prices and images
- Pricing packages
- Course details and spots left (`course.spotsLeft`)
- Process steps and contact-form topics
- `showPricing` to hide or show the pricing section

Images live in `src/assets/`. Styling is in `src/app/globals.css`.

## Project structure

| Path | What it is |
| --- | --- |
| `src/app/` | Page layout, metadata, global styles, favicon |
| `src/components/` | One component per page section |
| `src/content/site.ts` | All text, prices and contact details |
| `src/assets/` | Photos and service images |
| `design/` | Original design export (reference only, not deployed) |

## Publishing

`.github/workflows/deploy.yml` builds and deploys the site on every push to `main`.

One-time setup: in the repository on GitHub go to **Settings → Pages** and set
**Source** to **GitHub Actions**. The site will then be live at
`https://jaiderfeliciana.github.io/Jaider-Consulting/`.

To use your own domain later, add it under **Settings → Pages → Custom domain**.

## Build

```sh
npm run build   # outputs the static site to out/
```
