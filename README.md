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

The country list in the planner's time zone picker (`src/content/timezones.ts`) is generated from
the IANA time zone database. To refresh it: `node scripts/generate-timezones.mjs`.

Images live in `src/assets/`. Styling is in `src/app/globals.css`.

## Client service agreement (/agreement)

Clients read the agreement, fill in their details and sign with a finger or mouse. Signed
agreements appear in the admin panel under **Agreements**, where you countersign them and can
print or save them as PDF. Create a personal link there with the service and price filled in.
The terms are in `src/content/agreement.ts`; when you change them, also change `version`.
Signing needs the database (see below).

## Admin panel (/admin)

A private dashboard for running the business: Cal.com bookings, clients, earnings, tasks,
website visitors and a Grok AI assistant. Everything is set in the Vercel project (**Settings → Environment Variables**),
then redeploy:

| Setting | What it does |
| --- | --- |
| `ADMIN_PASSWORD` | Your login password. Without it, nobody can log in. |
| Upstash Redis (Vercel **Storage** tab) | Stores clients, payments and visitor counts. Connecting it adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. |
| `CAL_API_KEY` | Reads bookings from Cal.com (Cal.com → Settings → Developer → API keys). |
| `XAI_API_KEY` | Turns on the Grok assistant (console.x.ai → API Keys). Optional: `XAI_MODEL` to choose the model. |

The **Setup** page inside the panel shows what is connected.

## Project structure

| Path | What it is |
| --- | --- |
| `src/app/(site)/` | The public pages (home, booking planner) |
| `src/app/` | Root layout, metadata, global styles, favicon |
| `src/components/` | One component per page section |
| `src/content/site.ts` | All text, prices and contact details |
| `src/app/admin/`, `src/lib/admin/` | The admin panel |
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
