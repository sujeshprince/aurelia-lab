# Aurelia Lab — clinical skincare storefront

A fictional clinical-skincare brand site built with **plain HTML, CSS and JavaScript**,
now with a **live backend** (Supabase) and **real INR payments** (Razorpay).
No build step, no frameworks — open it in a browser and it works, online or offline.

## Live site

**https://sujeshprince.github.io/aurelia-lab/**

## Run it locally

```bash
cd skincare
python -m http.server 8513 --bind 127.0.0.1
# → http://127.0.0.1:8513
```

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Landing: hero, trust bar, bestsellers, shop-by-concern tiles, ingredient spotlight, 3-step protocol, testimonials |
| `shop.html` | Filter by category / concern / max price, live search, 5 sort orders, chips, load-more, mobile filter drawer |
| `product.html` | Renders from `?id=…`; gallery variants, published active %, tabs (description / INCI / usage), related products |
| `quiz.html` | 6-question consultation → skin type, ranked matches (with % score) and a 4-step routine; result saved to your account |
| `about.html` | Brand story, stats, formulation values, timeline |
| `contact.html` | Validated contact form (saved to the backend), FAQ accordion, support facts |

## Backend — what works when connected

| Feature | Demo mode (not connected) | Connected (see SETUP.md) |
| --- | --- | --- |
| Accounts | localStorage demo users | Real accounts, hashed passwords, sessions in the cloud |
| Bag | This browser only | Saved to your account, synced across devices |
| Checkout | Toast only | Razorpay payment (UPI/cards) **or** recorded "order without payment" |
| Contact / newsletter | Fake confirmation | Saved to the database (see `contact_messages`, `newsletter_subscribers`) |
| Quiz | Local only | Result saved to the account (`quiz_results`) |
| Orders | — | Stored in `orders` with server-verified totals |

The site **auto-detects** the backend: with empty keys in
`js/supabase-config.js` it behaves exactly like the original demo; fill in the
keys and everything upgrades itself. **Full connection walkthrough: `SETUP.md`.**

## Code map

```
js/supabase-config.js — backend URL / anon key / Razorpay key (fill me in)
js/supabase.js         — thin Supabase wrapper: auth, cart sync, forms, checkout calls
js/checkout.js         — checkout modal → create-order → Razorpay → verify-payment
js/data.js             — catalog of 16 products + helpers (the single source of truth)
js/ui.js               — generated SVG packaging art, star ratings, toasts, scroll-reveal, nav, newsletter
js/cart.js             — bag (localStorage + cloud sync), free-shipping meter, slide-out drawer
js/auth.js             — accounts: live (Supabase) or demo (localStorage) mode, modal in the header
js/home.js             — homepage render + shared product-card markup (window.renderCard)
js/shop.js             — filtering / search / sort / pagination
js/product.js          — product detail page
js/quiz.js             — quiz state machine + scoring, saves result to the account
js/forms.js            — contact validation + FAQ accordion
css/style.css          — design tokens, components, responsive breakpoints
vendor/supabase.min.js — the Supabase JS client, vendored (no CDN dependency)

supabase/migrations/   — SQL schema + row-level-security policies (`supabase db push`)
supabase/functions/    — Deno edge functions:
  create-order          — validates cart server-side, creates Razorpay order or manual order
  verify-payment        — verifies Razorpay signature, marks the order paid
  _shared/catalog.ts    — AUTO-GENERATED price list (run node tools/gen-catalog.js)
tools/gen-catalog.js    — regenerates the server catalogue from js/data.js
SETUP.md                — the step-by-step backend + payment connection guide
```

## Behaviour notes

- The bag persists in `localStorage` (key `skincare.cart.v1`) and — for signed-in
  users on a connected site — syncs to the `carts` table. Guest bags stay local.
- All prices are in **Indian Rupees (₹)** with Indian digit grouping, e.g. ₹1,199 / ₹1,899.
  Free delivery over ₹1,999; below that, ₹99 shipping (enforced server-side).
- Payment totals are always recomputed on the server from the shared catalogue —
  client prices are never trusted.
- Products are added straight from cards via a delegated `[data-add-to-cart]` handler; the
  product page honours its quantity selector via `data-qty-source`.
- All scroll/entrance animation respects `prefers-reduced-motion`.
- Cart drawer, account modal and checkout modal: focus-trapped, close on `Esc`,
  expose `aria-modal`/`aria-hidden`.
- Page zoom is locked at the viewport level (user-scalable=no) and best-effort
  in JS — browsers may still offer zoom as an accessibility control.
- **Security**: the anon key in `supabase-config.js` is public by design; every
  table is protected by the row-level-security policies in the migration. Never
  put the service-role key or Razorpay secret in the frontend — those live in
  Supabase function secrets.

## Testing

The site is verified with a jsdom harness covering rendering, cart
add/qty/remove, filters, search, sort, tabs, quiz scoring, routine add-to-bag,
form validation, FAQ, and the full account flow (register, validation,
duplicate email, wrong password, sign in, sign out). Rerun from the temp
checkout:

```
cd temp/skincare-test && node test.js
```

## Deploying changes

GitHub Pages auto-redeploys from the `main` branch of `sujeshprince/aurelia-lab`:

```bash
git add -A
git commit -m "…"
git push origin main
# ~1 minute later the change is live
```