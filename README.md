# Aurelia Lab — static skincare storefront

A fictional clinical-skincare brand site built with **plain HTML, CSS and JavaScript**.
No build step, no frameworks, no dependencies — open it in a browser and it works.

## Run it

Open any page directly (`index.html`), or serve the folder for the nicest experience:

```bash
cd skincare
python -m http.server 8513
# → http://127.0.0.1:8513
```

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Landing: hero, trust bar, bestsellers, shop-by-concern tiles, ingredient spotlight, 3-step protocol, testimonials |
| `shop.html` | Filter by category / concern / max price, live search, 5 sort orders, chips, load-more, mobile filter drawer |
| `product.html` | Renders from `?id=…`; gallery variants, published active %, tabs (description / INCI / usage), related products |
| `quiz.html` | 6-question consultation → skin type, ranked matches (with % score) and a 4-step routine you can add to the bag in one click |
| `about.html` | Brand story, stats, formulation values, timeline |
| `contact.html` | Validated contact form, FAQ accordion, support facts |

## Code map

```
js/data.js    — catalog of 16 products + helpers (the single source of truth)
js/ui.js      — generated SVG packaging art, star ratings, toasts, scroll-reveal, nav, newsletter
js/cart.js    — localStorage bag, free-shipping meter, slide-out drawer (injected on every page)
js/auth.js    — demo accounts: sign in / create account / sign out modal (injected on every page)
js/home.js    — homepage render + shared product-card markup (window.renderCard)
js/shop.js    — filtering / search / sort / pagination
js/product.js — product detail page
js/quiz.js    — quiz state machine + scoring
js/forms.js   — contact validation + FAQ accordion
css/style.css — design tokens, components, responsive (3 breakpoints)
```

## What "clinical luxury" means here

- Palette: porcelain white, ink charcoal, deep clinical green, warm sand accents.
- Fraunces (serif display) + Inter (UI) + IBM Plex Mono (data labels), via Google Fonts with system fallbacks.
- Sharp 2px radii, hairline rules, uppercase letter-spaced micro-labels.
- Product images are **deterministic inline SVGs** — every bottle/jar/tube is generated from the
  product's data, so nothing ever breaks or needs a network request.

## Behaviour notes

- The bag persists in `localStorage` (key `skincare.cart.v1`) across pages and reloads.
- All prices are in **Indian Rupees (₹)** with Indian digit grouping, e.g. ₹1,199 / ₹1,899.
- The **account** feature (header button → sign in / create account) is a client-side demo:
  users live under `skincare.users.v1`, the active session under `skincare.session.v1`.
  Passwords are stored with a lightweight hash only — no real security, no server.
- Products are added straight from cards via a delegated `[data-add-to-cart]` handler; the
  product page honours its quantity selector via `data-qty-source`.
- All scroll/entrance animation respects `prefers-reduced-motion`.
- Cart drawer and account modal: focus-trapped, close on `Esc`, expose `aria-modal`/`aria-hidden`.
- **Checkout, payment and form submission are simulated** — this is a demonstration storefront.

## Testing

The site was verified with a throwaway jsdom harness (78 assertions across all six pages:
rendering, cart add/qty/remove, drawer, filters, search, sort, empty state, tabs, quiz scoring,
routine add-to-bag, form validation, FAQ, and the full account flow: register, validation,
duplicate email, wrong password, sign in, sign out). Rerun from the temp checkout:

```
cd temp/skincare-test && node test.js
```