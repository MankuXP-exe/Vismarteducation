# Vi Smart Learning Education

Full-stack EdTech platform for Vi Smart Learning Education.

## Stack

- Next.js App Router frontend
- Supabase auth and database
- Razorpay payments
- LiveKit live classes
- VPS API for LiveKit tokens, local recording storage, uploads, notes, and storage monitoring
- Nginx routing for `api.vismart.com`, `stream.vismart.com`, and `live.vismart.com`

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## VPS API

The VPS service lives in `streaming-api/`.

```bash
cd streaming-api
npm install
cp .env.example .env
npm start
```

Production storage paths:

- `/opt/vi-smart/recordings`
- `/opt/vi-smart/notes`
- `/opt/vi-smart/thumbnails`
- `/opt/vi-smart/temp`

## Deployment Notes

- Do not commit `.env`, `.env.local`, or production secrets.
- Add frontend environment variables in Vercel.
- Add VPS API variables in `/opt/vi-smart-api/.env`.
- Run Supabase migrations from `supabase/migrations`.
- Point DNS records for `api`, `stream`, and `live` subdomains to the VPS, then issue SSL with Certbot.
