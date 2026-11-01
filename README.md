# Jaider Feliciana — Website

Website for Jaider Feliciana's web design, social media and ads services in Aruba.
Built with [Next.js](https://nextjs.org) and hosted on [Vercel](https://vercel.com).

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
- `booking`: the sessions on the `/book` planner page, and your Cal.com username

### Booking planner (/book)

The planner uses [Cal.com](https://cal.com). Booked times disappear from the calendar
automatically. To turn it on:

1. Create a free Cal.com account and set your hours under **Availability**.
2. Create two event types whose links end in `free-consultation` (30 min) and `1-on-1` (60 min).
3. Put your Cal.com username in `booking.calUsername` in `src/content/site.ts`.

Until then the page offers booking through WhatsApp.

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

The site is deployed by Vercel, which is connected to this GitHub repository.
Every push to `main` updates the live site; pushes to other branches get a preview link.

## Build

```sh
npm run build   # production build
npm start       # serve the production build locally
```
