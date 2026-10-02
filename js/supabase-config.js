/* ==========================================================================
   AURELIA LAB — supabase-config.js
   Backend connection settings (see SETUP.md for the full walkthrough).

   1. Create a free project at https://supabase.com (sign in → New project)
   2. Copy the Project URL and the public anon key from:
      Project Settings → API
   3. Paste them below. The anon key is the *public* client key, designed to
      be shipped to browsers — it is safe in this repository. Never paste the
      service_role key (or any secret) here.

   Razorpay: create an account at https://razorpay.com, then copy the Key Id
   from Dashboard → Settings → API Keys. Leave blank to run checkout in
   "order without payment" mode (orders are still recorded).

   While any of these are empty the site runs in offline/demo mode: accounts
   and carts stay in this browser, forms show a confirmation but send nothing.
   ========================================================================== */

var SUPABASE_CONFIG = {
  /* Project URL, e.g. "https://abcdefghijklmnopq.supabase.co" */
  url: '',

  /* Public anon key (Project Settings → API → anon public) */
  anonKey: '',

  /* Razorpay publishable key (Dashboard → Settings → API Keys → Key Id) */
  razorpayKeyId: ''
};