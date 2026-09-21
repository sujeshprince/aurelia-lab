/* ==========================================================================
   AURELIA LAB — auth.js
   Client-side account demo: sign in / create account / sign out from a modal
   injected into the header of every page. Users and the active session live
   in localStorage only — there is no backend.
   Depends on: ui.js (UI)
   ========================================================================== */

var Auth = (function () {
  'use strict';

  var USERS_KEY = 'skincare.users.v1';
  var SESSION_KEY = 'skincare.session.v1';

  var els = {};
  var lastFocus = null;

  /* ------------------------------------------------------------------ */
  /*  Persistence                                                       */
  /* ------------------------------------------------------------------ */

  /* Tiny non-crypto hash so passwords are not stored in plain text.
     This is a demonstration storefront — not real security. */
  function hashPassword(password) {
    var h = 5381;
    for (var i = 0; i < password.length; i++) {
      h = ((h << 5) + h + password.charCodeAt(i)) | 0;
    }
    return 'h' + (h >>> 0).toString(36);
  }

  function loadUsers() {
    try {
      var raw = window.localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (err) { return []; }
  }

  function saveUsers(users) {
    try { window.localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (err) { /* noop */ }
  }

  function findUser(email) {
    var norm = String(email || '').trim().toLowerCase();
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === norm) return users[i];
    }
    return null;
  }

  function currentUser() {
    try {
      var raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) || null) : null;
    } catch (err) { return null; }
  }

  function setSession(user) {
    try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (err) { /* noop */ }
  }

  function clearSession() {
    try { window.localStorage.removeItem(SESSION_KEY); } catch (err) { /* noop */ }
  }

  /* ------------------------------------------------------------------ */
  /*  Actions                                                           */
  /* ------------------------------------------------------------------ */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function register(fields) {
    var errors = {};
    if (!fields.name || String(fields.name).trim().length < 2) {
      errors.name = 'Please enter your name.';
    }
    if (!EMAIL_RE.test(String(fields.email || ''))) {
      errors.email = 'Enter a valid email address.';
    }
    if (!fields.password || String(fields.password).length < 8) {
      errors.password = 'Use at least 8 characters.';
    }
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    if (findUser(fields.email)) {
      return { ok: false, errors: { email: 'An account with this email already exists. Sign in instead.' } };
    }

    var user = {
      name: String(fields.name).trim(),
      email: String(fields.email).trim().toLowerCase(),
      hash: hashPassword(String(fields.password))
    };

    var users = loadUsers();
    users.push(user);
    saveUsers(users);
    setSession({ name: user.name, email: user.email });

    return { ok: true, user: user };
  }

  function signIn(fields) {
    var email = String(fields.email || '').trim().toLowerCase();
    var password = String(fields.password || '');

    var errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var user = findUser(email);
    if (!user || user.hash !== hashPassword(password)) {
      return { ok: false, errors: { password: 'Incorrect email or password.' } };
    }

    setSession({ name: user.name, email: user.email });
    return { ok: true, user: user };
  }

  function signOut() {
    clearSession();
    UI.toast('You\u2019ve been signed out.', 'info');
  }

  /* ------------------------------------------------------------------ */
  /*  Header control                                                    */
  /* ------------------------------------------------------------------ */

  function displayName(user) {
    if (!user) return '';
    var first = String(user.name).split(/\s+/)[0] || user.name;
    return first.length > 12 ? first.slice(0, 12) + '\u2026' : first;
  }

  function initialOf(name) {
    var first = String(name || '').replace(/\s+/g, ' ').trim().split(' ')[0] || 'A';
    return first.charAt(0).toUpperCase();
  }

  function renderHeader() {
    var label = document.querySelector('[data-auth-label]');
    var badge = document.querySelector('[data-auth-badge]');
    if (!label || !badge) return;

    var user = currentUser();
    if (user) {
      label.textContent = displayName(user);
      badge.textContent = initialOf(user.name);
      badge.classList.add('is-signed-in');
      badge.setAttribute('aria-label', 'Signed in as ' + user.name);
    } else {
      label.textContent = 'Sign in';
      badge.textContent = '\u25ef';
      badge.classList.remove('is-signed-in');
      badge.setAttribute('aria-label', 'Not signed in');
    }
  }

  function mountHeader() {
    if (document.querySelector('[data-auth-open]')) return;
    var actions = document.querySelector('.header-actions');
    if (!actions) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'account-btn';
    btn.setAttribute('data-auth-open', '');
    btn.setAttribute('aria-label', 'Account');
    btn.innerHTML =
      '<span class="account-btn__badge" data-auth-badge aria-hidden="true">\u25ef</span>' +
      '<span class="account-btn__label" data-auth-label>Sign in</span>';
    actions.insertBefore(btn, actions.firstChild);
  }

  /* ------------------------------------------------------------------ */
  /*  Modal markup                                                      */
  /* ------------------------------------------------------------------ */

  function panelsHTML(active) {
    active = active || 'signin';
    var signinHidden = active === 'signin' ? '' : ' hidden';
    var signupHidden = active === 'signup' ? '' : ' hidden';

    return (
      '<div class="auth-tabs" role="tablist" aria-label="Account actions">' +
        '<button type="button" class="auth-tab' + (active === 'signin' ? ' is-active' : '') + '" role="tab" aria-selected="' +
          (active === 'signin' ? 'true' : 'false') + '" data-auth-tab="signin">Sign in</button>' +
        '<button type="button" class="auth-tab' + (active === 'signup' ? ' is-active' : '') + '" role="tab" aria-selected="' +
          (active === 'signup' ? 'true' : 'false') + '" data-auth-tab="signup">Create account</button>' +
      '</div>' +


      '<div class="auth-panel" data-auth-panel="signin"' + signinHidden + '>' +
        '<form data-auth-form="signin" novalidate>' +
          '<div class="field">' +
            '<label class="field__label" for="alEmail">Email</label>' +
            '<input class="field__input" id="alEmail" type="email" name="email" autocomplete="email" placeholder="you@example.com">' +
            '<span class="field__error" role="alert" data-auth-error="email"></span>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="alPassword">Password</label>' +
            '<input class="field__input" id="alPassword" type="password" name="password" autocomplete="current-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">' +
            '<span class="field__error" role="alert" data-auth-error="password"></span>' +
          '</div>' +
          '<button class="btn btn--primary btn--block" type="submit">Sign in</button>' +
          '<p class="auth-note">Demo storefront \u2014 accounts live only in this browser. Nothing is sent anywhere.</p>' +
        '</form>' +
      '</div>' +


      '<div class="auth-panel" data-auth-panel="signup"' + signupHidden + '>' +
        '<form data-auth-form="signup" novalidate>' +
          '<div class="field">' +
            '<label class="field__label" for="alName">Full name</label>' +
            '<input class="field__input" id="alName" type="text" name="name" autocomplete="name" placeholder="Aurelia Member">' +
            '<span class="field__error" role="alert" data-auth-error="name"></span>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="alNewEmail">Email</label>' +
            '<input class="field__input" id="alNewEmail" type="email" name="email" autocomplete="email" placeholder="you@example.com">' +
            '<span class="field__error" role="alert" data-auth-error="email"></span>' +
          '</div>' +
          '<div class="field">' +
            '<label class="field__label" for="alNewPassword">Password</label>' +
            '<input class="field__input" id="alNewPassword" type="password" name="password" autocomplete="new-password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022">' +
            '<span class="field__error" role="alert" data-auth-error="password"></span>' +
            '<span class="field__hint">At least 8 characters.</span>' +
          '</div>' +
          '<button class="btn btn--primary btn--block" type="submit">Create account</button>' +
          '<p class="auth-note">Free. Unlocks faster checkout in this demo. No marketing, ever.</p>' +
        '</form>' +
      '</div>'
    );
  }

  function signedInHTML(user) {
    return (
      '<div class="auth-user">' +
        '<span class="auth-user__initial" aria-hidden="true">' + UI.esc(initialOf(user.name)) + '</span>' +
        '<div>' +
          '<p class="auth-user__name">' + UI.esc(user.name) + '</p>' +
          '<p class="auth-user__email">' + UI.esc(user.email) + '</p>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="btn btn--ghost btn--block" data-auth-signout>Sign out</button>' +
      '<p class="auth-note">Session is stored on this device only.</p>'
    );
  }

  function modalHTML() {
    return (
      '<div class="modal-overlay" data-auth-overlay hidden></div>' +
      '<div class="auth-modal" data-auth-modal role="dialog" aria-modal="true" aria-labelledby="authTitle" aria-hidden="true" hidden>' +
        '<div class="auth-modal__head">' +
          '<h2 id="authTitle">Account</h2>' +
          '<button type="button" class="icon-btn" data-auth-close aria-label="Close account">\u2715</button>' +
        '</div>' +
        '<div class="auth-modal__body" data-auth-body></div>' +
      '</div>'
    );
  }

  function renderModal() {
    if (!els.body) return;
    var user = currentUser();
    els.body.innerHTML = user ? signedInHTML(user) : panelsHTML();
    els.modal.setAttribute('data-auth-state', user ? 'signed-in' : 'guest');
  }

  /* ------------------------------------------------------------------ */
  /*  Open / close                                                      */
  /* ------------------------------------------------------------------ */

  function isOpen() {
    return els.modal && els.modal.classList.contains('is-open');
  }

  function open() {
    if (!els.modal || isOpen()) return;
    lastFocus = document.activeElement;
    renderModal();
    els.overlay.hidden = false;
    els.modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(function () {
      els.overlay.classList.add('is-open');
      els.modal.classList.add('is-open');
    });
    els.modal.setAttribute('aria-hidden', 'false');

    var firstInput = els.modal.querySelector('.auth-panel:not([hidden]) input, .auth-user');
    if (document.querySelector('[data-auth-signout]')) {
      document.querySelector('[data-auth-signout]').focus();
    } else if (firstInput && firstInput.focus) {
      firstInput.focus();
    }
  }

  function close() {
    if (!els.modal || !isOpen()) return;
    els.modal.classList.remove('is-open');
    els.overlay.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    setTimeout(function () {
      if (els.modal && !els.modal.classList.contains('is-open')) {
        els.modal.hidden = true;
        els.overlay.hidden = true;
      }
    }, 300);

    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function switchTab(tab) {
    if (!els.modal) return;
    Array.prototype.forEach.call(els.modal.querySelectorAll('[data-auth-tab]'), function (btn) {
      var active = btn.getAttribute('data-auth-tab') === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    Array.prototype.forEach.call(els.modal.querySelectorAll('[data-auth-panel]'), function (panel) {
      panel.hidden = panel.getAttribute('data-auth-panel') !== tab;
    });
    var input = els.modal.querySelector('[data-auth-panel="' + tab + '"] input');
    if (input) input.focus();
    renderErrors(tab, {});
  }

  function trapFocus(event) {
    if (!isOpen() || event.key !== 'Tab') return;
    var focusable = els.modal.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Form handling                                                     */
  /* ------------------------------------------------------------------ */

  function renderErrors(form, errors) {
    var container = els.modal.querySelector('[data-auth-form="' + form + '"]');
    if (!container) return;
    ['name', 'email', 'password'].forEach(function (key) {
      var field = container.querySelector('[name="' + key + '"]');
      var fieldWrap = field ? (field.closest('.field') || field.parentNode) : null;
      var errEl = container.querySelector('[data-auth-error="' + key + '"]');
      var message = errors[key] || '';
      if (fieldWrap) fieldWrap.classList.toggle('has-error', Boolean(message));
      if (errEl) errEl.textContent = message;
      if (field) field.setAttribute('aria-invalid', String(Boolean(message)));
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    var form = event.target.closest('[data-auth-form]');
    if (!form) return;
    var mode = form.getAttribute('data-auth-form');

    function read() {
      var out = {};
      ['name', 'email', 'password'].forEach(function (key) {
        var input = form.querySelector('[name="' + key + '"]');
        if (input) out[key] = input.value;
      });
      return out;
    }

    var result = mode === 'signup' ? register(read()) : signIn(read());
    renderErrors(mode, result.errors || {});

    if (!result.ok) {
      var firstError = form.querySelector('.field.has-error input');
      if (firstError) firstError.focus();
      return;
    }

    var user = result.user;
    renderHeader();
    updateCartStatus();
    close();
    UI.toast(
      mode === 'signup'
        ? 'Account created \u2014 welcome, ' + displayName(user) + '.'
        : 'Signed in as ' + displayName(user) + '.',
      'success'
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Cart drawer status line                                           */
  /* ------------------------------------------------------------------ */

  function updateCartStatus() {
    var foot = document.querySelector('.cart-drawer__foot');
    if (!foot) return;

    var chip = foot.querySelector('[data-auth-status]');
    if (!chip) {
      chip = document.createElement('p');
      chip.className = 'cart-auth';
      chip.setAttribute('data-auth-status', '');
      foot.insertBefore(chip, foot.firstChild);
    }

    var user = currentUser();
    chip.textContent = user
      ? 'Signed in \u2014 ' + user.name + ' \u00b7 demo checkout'
      : 'Guest checkout \u2014 no account required';
  }

  /* ------------------------------------------------------------------ */
  /*  Mount                                                             */
  /* ------------------------------------------------------------------ */

  function bind() {
    var holder = document.createElement('div');
    holder.innerHTML = modalHTML();
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    els.modal = document.querySelector('[data-auth-modal]');
    els.overlay = document.querySelector('[data-auth-overlay]');
    els.body = els.modal.querySelector('[data-auth-body]');

    els.overlay.addEventListener('click', close);
    els.modal.querySelector('[data-auth-close]').addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
      trapFocus(event);
    });

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-auth-open]');
      if (trigger) { event.preventDefault(); open(); }
    });

    document.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-auth-tab]');
      if (tab) switchTab(tab.getAttribute('data-auth-tab'));
    });

    document.addEventListener('click', function (event) {
      var signout = event.target.closest('[data-auth-signout]');
      if (signout) {
        signOut();
        renderHeader();
        updateCartStatus();
        close();
      }
    });

    document.addEventListener('submit', function (event) {
      if (event.target.closest('[data-auth-form]')) handleSubmit(event);
    });

    renderHeader();
    updateCartStatus();
  }

  function init() {
    mountHeader();
    bind();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    currentUser: currentUser,
    register: register,
    signIn: signIn,
    signOut: signOut,
    renderHeader: renderHeader,
    updateCartStatus: updateCartStatus
  };
})();