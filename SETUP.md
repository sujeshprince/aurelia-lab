# 🧪 SETUP — connecting Aurelia Lab to its backend (Supabase + Razorpay)

The site ships in **demo mode**: everything works visually, but accounts, carts
and forms live only in this browser. This guide turns on the real backend.
Expected time: **~20 minutes**, mostly waiting for pages to load.

---

## 1. Create the free Supabase project

1. Go to https://supabase.com and sign in (free).
2. Click **New project** → name it `aurelia-lab`, pick a region close to you
   (e.g. `ap-south-1` Mumbai), set a database password and create it.
3. While it provisions (2–3 min), continue below.

## 2. Paste the connection keys into the frontend

1. In the Supabase dashboard open **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `js/supabase-config.js` in this repo and fill in:

```js
var SUPABASE_CONFIG = {
  url: 'https://xxxxxxxxxxxxxxxx.supabase.co',
  anonKey: 'eyJhbGciOi...',            // anon public — safe to commit
  razorpayKeyId: ''                      // add in step 5
};
```

4. (Optional) In **Authentication → Providers → Email**, decide whether new
   sign-ups must confirm their email first. Recommended for a real launch:
   stay confirmed. For instant testing you may turn confirmation **off**.
5. Commit & push: the GitHub Pages site now talks to your backend for
   accounts, saved bags, forms and the quiz.

## 3. Create the database tables (security rules included)

You need the **Supabase CLI**. From PowerShell:

```powershell
npm install -g supabase
cd D:\openai vscode\skincare
supabase login          # opens a browser — approve it once
supabase link --project-ref <your-project-ref>   # ref is in Project Settings → General
supabase db push
```

Alternatively open **SQL Editor → New query** in the dashboard, paste the
contents of `supabase/migrations/20261003000000_init.sql` and press **Run**.

## 4. Deploy the payment edge functions

```powershell
supabase functions deploy create-order
supabase functions deploy verify-payment
```

You can test them right away **without Razorpay** — checkout falls back to
"order without payment" and still records orders in the database.

## 5. Turn on real INR payments with Razorpay

Razorpay is the Indian payment gateway (UPI, cards, netbanking, wallets).

1. Create a **test account** at https://razorpay.com (Dashboard → Test Mode).
2. Copy **Key Id** and **Key Secret** from **Settings → API Keys**.
3. Set them as Supabase function secrets:

```powershell
supabase secrets set RAZORPAY_KEY_ID="rzp_test_xxxxxxxx"
supabase secrets set RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxx"
```

4. Put the publishable **Key Id** into `js/supabase-config.js`
   (`razorpayKeyId: 'rzp_test_...'`), commit and push.
5. Test checkout with Razorpay's test cards:
   - Card: `4111 1111 1111 1111`, any future expiry, any CVV
   - UPI test id: `success@razorpay` — or `failure@razorpay` to see a failed
     payment handled gracefully.

> Go-live: switch Razorpay from Test to Live mode, use the **live** keys, and
> verify the merchant account (KYC) in the Razorpay dashboard. Put the **live**
> Key Id in `supabase-config.js` and the **live** Key Secret in Supabase.

## 6. Verify

- **Accounts**: header button → Create account → confirm email → sign in on a
  phone and a laptop — same account, saved bag on both.
- **Cart**: add items signed in, open the site on another device → bag is there.
- **Checkout**: bag → Checkout → details → Razorpay test payment → order
  marked paid, bag cleared.
- **Forms**: contact page and footer newsletter — rows appear in
  **Table Editor** under `contact_messages` / `newsletter_subscribers`.
- **Quiz**: complete the quiz signed in → row in `quiz_results`.
- **Orders**: appear in `orders` (Table Editor / SQL editor).

## Security notes (read before launch)

- The **anon key is public by design** — all your data is protected by the row
  level security policies in the migration. Never paste the **service_role**
  key into the frontend or this repo.
- Order totals are recomputed **server-side** from `supabase/functions/_shared/
  catalog.ts` (generated from `js/data.js`). If you change prices in
  `js/data.js`, regenerate with `node tools/gen-catalog.js` and re-deploy.
- Manual "order without payment" is intentionally open (anyone can record a
  pending order). Add rate-limiting or switch to Razorpay-only when you launch.

## Useful commands

```powershell
# Watch the frontend locally with a live server
python -m http.server 8513 --bind 127.0.0.1

# Re-deploy after editing functions
supabase functions deploy create-order
supabase functions deploy verify-payment

# View orders from SQL
# select * from public.orders order by created_at desc;
```