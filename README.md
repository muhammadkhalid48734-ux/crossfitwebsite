# Ironline Strength (demo)

Static multi-page trial-booking site (Home, First class, Schedule, Coaches, Memberships, Visit). Each page is a tiny HTML shell rendered from `config.js` by `script.js`. No build step. Open `index.html`, or deploy the folder to Vercel or Cloudflare Pages.

Clone for a new gym: copy the folder, edit `config.js`, replace files in `images/`. For a new niche also swap the THEME TOKENS block at the top of `styles.css` (and the Google Fonts link in `index.html` if the fonts change).

Demo tips:
- `webhookUrl` empty: bookings are simulated after 900ms and logged to the console.
- Add `?simulate=error` to the URL to demo the error and retry state (only while `webhookUrl` is empty).
- The webhook receives JSON: firstName, phone, email, slotDay, slotTime, gymName, submittedAt (ISO), source ("website"). Allow your site origin in the n8n Webhook node's CORS option.
