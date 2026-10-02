/* ==========================================================================
   AURELIA LAB — supabase.js
   Thin wrapper around the Supabase client used across the site.

   The whole site degrades gracefully: when the backend has not been
   configured yet (empty keys in supabase-config.js) every call is a safe
   no-op and the site keeps working exactly as before in demo mode.

   Depends on: vendor/supabase.min.js (window.supabase), js/supabase-config.js
   ========================================================================== */

var Supa = (function () {
  'use strict';

  var config = (typeof SUPABASE_CONFIG !== 'undefined') ? SUPABASE_CONFIG : null;
  var hasLib = (typeof supabase !== 'undefined') && supabase && typeof supabase.createClient === 'function';

  var client = null;
  var ready = false;
  var _user = null; // { id, email, name } mirror, read synchronously anywhere
  var authListeners = [];

  function isReady() { return ready; }
  function getClient() { return client; }

  /* Map a Supabase session (or null) to the shape the rest of the site uses. */
  function mapUser(session) {
    if (!session || !session.user) return null;
    var u = session.user;
    var meta = u.user_metadata && u.user_metadata.full_name ? String(u.user_metadata.full_name) : '';
    var name = meta || (u.email ? String(u.email).split('@')[0] : 'Member');
    return { id: u.id, email: u.email || '', name: name };
  }

  function setUser(session) {
    _user = mapUser(session);
    return _user;
  }

  function notify(event, user) {
    for (var i = 0; i < authListeners.length; i++) {
      try { authListeners[i](user, event); } catch (err) { /* a listener must never break others */ }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                              */
  /* ------------------------------------------------------------------ */

  function init() {
    if (ready || !config || !config.url || !config.anonKey || !hasLib) return false;
    try {
      client = supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      ready = true;
    } catch (err) {
      ready = false;
      return false;
    }

    /* Keep a synchronous mirror of the auth state for the rest of the site. */
    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_OUT') {
        _user = null;
        notify(event, null);
        return;
      }
      var user = setUser(session);
      authListeners.length && notify(event, user);
    });

    /* supabase-js reads the stored session asynchronously — replay it on load. */
    Promise.resolve(client.auth.getSession())
      .then(function (res) {
        var session = res && res.data ? res.data.session : null;
        var user = setUser(session);
        notify('INITIAL_SESSION', user);
      })
      .catch(function () { /* no stored session */ });

    return true;
  }

  /* ------------------------------------------------------------------ */
  /*  Auth helpers (used by auth.js)                                     */
  /* ------------------------------------------------------------------ */

  function mapAuthError(err) {
    var msg = (err && err.message) ? String(err.message) : '';
    var l = msg.toLowerCase();

    if (l.indexOf('already registered') !== -1 || l.indexOf('already be used') !== -1) {
      return { email: 'An account with this email already exists. Sign in instead.' };
    }
    if (l.indexOf('at least') !== -1) {
      return { password: 'Use at least 8 characters.' };
    }
    if (l.indexOf('invalid login credentials') !== -1) {
      return { password: 'Incorrect email or password.' };
    }
    if (l.indexOf('not confirmed') !== -1 || l.indexOf('confirm your email') !== -1) {
      return { password: 'Please confirm your email first — check your inbox.' };
    }
    if (err && err.status && err.status >= 400) {
      return { password: 'Something went wrong on our side. Please try again.' };
    }
    return { password: msg || 'Something went wrong. Please try again.' };
  }

  function signUp(fields) {
    var params = {
      email: String(fields.email || '').trim().toLowerCase(),
      password: String(fields.password || ''),
      options: { data: { full_name: String(fields.name || '').trim() } }
    };
    return Promise.resolve(client.auth.signUp(params))
      .then(function (res) {
        if (res.error) return { ok: false, errors: mapAuthError(res.error) };
        var session = res.data && res.data.session ? res.data.session : null;
        if (session) {
          _user = mapUser(session);
          return { ok: true, user: _user, needsConfirmation: false };
        }
        /* Email confirmation is enabled in the Supabase dashboard: the user
           gets a link before the account can be used. */
        return { ok: true, needsConfirmation: true };
      })
      .catch(function (err) { return { ok: false, errors: mapAuthError(err) }; });
  }

  function signIn(fields) {
    return Promise.resolve(client.auth.signInWithPassword({
      email: String(fields.email || '').trim(),
      password: String(fields.password || '')
    }))
      .then(function (res) {
        if (res.error) return { ok: false, errors: mapAuthError(res.error) };
        var session = res.data && res.data.session ? res.data.session : null;
        _user = mapUser(session);
        return { ok: true, user: _user };
      })
      .catch(function (err) { return { ok: false, errors: mapAuthError(err) }; });
  }

  function signOut() {
    return Promise.resolve(client.auth.signOut()).catch(function () { /* noop */ });
  }

  function currentUser() { return _user; }

  function onAuthChange(fn) {
    if (typeof fn === 'function') authListeners.push(fn);
  }

  /* ------------------------------------------------------------------ */
  /*  Cart persistence (server-side bag for signed-in users)             */
  /* ------------------------------------------------------------------ */

  function cartLoad() {
    if (!ready || !_user) return Promise.resolve([]);
    return Promise.resolve(client.from('carts').select('items').eq('user_id', _user.id).maybeSingle())
      .then(function (res) {
        if (res.error) return [];
        return (res.data && Array.isArray(res.data.items)) ? res.data.items : [];
      })
      .catch(function () { return []; });
  }

  function cartSave(items) {
    if (!ready || !_user) return Promise.resolve(false);
    return Promise.resolve(client.from('carts').upsert({
      user_id: _user.id,
      items: items,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }))
      .then(function (res) { return !res.error; })
      .catch(function () { return false; });
  }

  /* ------------------------------------------------------------------ */
  /*  Forms & quiz                                                      */
  /* ------------------------------------------------------------------ */

  function saveContact(payload) {
    if (!ready) return Promise.resolve(false);
    return Promise.resolve(client.from('contact_messages').insert(payload))
      .then(function (res) { return !res.error; })
      .catch(function () { return false; });
  }

  function saveNewsletter(email) {
    if (!ready) return Promise.resolve(false);
    return Promise.resolve(client.from('newsletter_subscribers').upsert({ email: email }, { onConflict: 'email' }))
      .then(function (res) { return !res.error; })
      .catch(function () { return false; });
  }

  function saveQuizResult(payload) {
    if (!ready || !_user) return Promise.resolve(false);
    return Promise.resolve(client.from('quiz_results').upsert(payload, { onConflict: 'user_id' }))
      .then(function (res) { return !res.error; })
      .catch(function () { return false; });
  }

  function getOrders() {
    if (!ready || !_user) return Promise.resolve([]);
    return Promise.resolve(client.from('orders').select('id, items, total, status, mode, created_at').order('created_at', { ascending: false }).limit(20))
      .then(function (res) { return res.error ? [] : (res.data || []); })
      .catch(function () { return []; });
  }

  /* ------------------------------------------------------------------ */
  /*  Checkout (edge functions)                                          */
  /* ------------------------------------------------------------------ */

  function createOrder(payload) {
    if (!ready) return Promise.reject(new Error('backend-not-ready'));
    return Promise.resolve(client.functions.invoke('create-order', { body: payload }))
      .then(function (res) {
        if (res.error) throw new Error((res.error.message) || 'create-order failed');
        if (!res.data) throw new Error('No response from the payment service.');
        return res.data;
      });
  }

  function verifyPayment(payload) {
    if (!ready) return Promise.reject(new Error('backend-not-ready'));
    return Promise.resolve(client.functions.invoke('verify-payment', { body: payload }))
      .then(function (res) {
        if (res.error) throw new Error((res.error.message) || 'verify-payment failed');
        return res.data || { ok: false };
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    isReady: isReady,
    getClient: getClient,
    currentUser: currentUser,
    onAuthChange: onAuthChange,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    cartLoad: cartLoad,
    cartSave: cartSave,
    saveContact: saveContact,
    saveNewsletter: saveNewsletter,
    saveQuizResult: saveQuizResult,
    getOrders: getOrders,
    createOrder: createOrder,
    verifyPayment: verifyPayment
  };
})();