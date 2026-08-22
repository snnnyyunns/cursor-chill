# A letter

Interactive love letter for Cursor Build Salaya: write sentences on a timeline, share a link, the recipient opens an envelope.

## Live (anyone can open)

**https://cursor-chill.vercel.app**

| What | URL |
| --- | --- |
| Home | https://cursor-chill.vercel.app |
| Write a letter | https://cursor-chill.vercel.app/create |
| Demo as a viewer | https://cursor-chill.vercel.app/v/demo |

After you write, click **Copy share link** and send that short URL (`/v/…`). Recipients open it in any browser — they do not need GitHub, Cursor, or `npm`.

Vercel Deployment Protection (SSO) is **off** on this project, so those URLs are public. If a login wall comes back, disable it in Vercel: **Settings → Deployment Protection**.

## Local

```bash
npm install
npm run dev
```

Then http://localhost:3000

## Deploy

The production project is `cursor-chill` on the Vercel account that ran `vercel --prod`. To publish again from this repo:

```bash
vercel login
vercel --yes --prod
```
