/* ==========================================================================
   AURELIA LAB — checkout.js
   Real checkout flow for the bag drawer.

   Requires the Supabase backend (Supa) to be connected:
   1. Asks for name / email / phone (pre-filled when signed in).
   2. Calls the create-order edge function. The server validates every item
      against its own catalogue and either:
        • returns a Razorpay order → Razorpay checkout opens (real payment), or
        • returns a manual order → “order without payment” (recorded only).
   3. On Razorpay success the verify-payment edge function verifies the
      signature and marks the order paid.

   Depends on: ui.js (UI), cart.js (Cart), supabase.js (Supa)
   ========================================================================== */

var Checkout = (function () {
  'use strict';

  var FREE_SHIPPING = 1999;
  var SHIPPING_FEE = 99;

  var busy = false;
  var els = {};
  var lastFocus = null;

  function backendActive() {
    return (typeof Supa !== 'undefined') && Supa.isReady();
  }

  /* ------------------------------------------------------------------ */
  /*  Modal                                                             */
  /* ------------------------------------------------------------------ */

  function summaryHTML() {
    var items = Cart.items();
    var subtotal = items.reduce(function (sum, it) { return sum + (it.product ? it.product.price * it.qty : 0); }, 0);
    var shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
    var lines = items.map(function (it) {
      return '<div class="co-row"><span>' + UI.esc(it.product ? it.product.name : it.id) +
        ' <em class="co-qty">\u00d7' + it.qty + '</em></span>' +
        '<strong>' + formatPrice(it.product ? it.product.price * it.qty : 0) + '</strong></div>';
    });

    return '' +
      '<div class="checkout-summary">' +
        lines.join('') +
        '<div class="co-row"><span>Delivery</span><strong>' +
          (shipping === 0 ? 'Free' : formatPrice(shipping)) + '</strong></div>' +
        '<div class="co-row co-total"><span>Total to pay</span><strong>' + formatPrice(subtotal + shipping) + '</strong></div>' +
      '</div>' +
      '<p class="co-note">Cash or UPI\u00b7card via Razorpay, or place an order to pay later. ' +
        'Free delivery over ' + formatPrice(FREE_SHIPPING) + '.</p>';
  }

  function modalHTML() {
    var user = (typeof Supa !== 'undefined' && Supa.isReady()) ? Supa.currentUser() : null;
    var name = user ? user.name : '';
    var email = user ? user.email : '';

    return (
      '<div class="modal-overlay" data-checkout-overlay hidden></div>' +
      '<div class="auth-modal checkout-modal" data-checkout-modal role="dialog" aria-modal="true" aria-labelledby="checkoutTitle" aria-hidden="true" hidden>' +
        '<div class="auth-modal__head">' +
          '<h2 id="checkoutTitle">Checkout</h2>' +
          '<button type="button" class="icon-btn" data-checkout-close aria-label="Close checkout">\u2715</button>' +
        '</div>' +
        '<div class="auth-modal__body">' +
          '<form data-checkout-form novalidate>' +
            '<div class="field">' +
              '<label class="field__label" for="coName">Full name</label>' +
              '<input class="field__input" id="coName" type="text" name="name" autocomplete="name" placeholder="Aurelia Member" value="' + UI.esc(name) + '">' +
              '<span class="field__error" role="alert"></span>' +
            '</div>' +
            '<div class="field">' +
              '<label class="field__label" for="coEmail">Email for the receipt</label>' +
              '<input class="field__input" id="coEmail" type="email" name="email" autocomplete="email" placeholder="you@example.com" value="' + UI.esc(email) + '">' +
              '<span class="field__error" role="alert"></span>' +
            '</div>' +
            '<div class="field">' +
              '<label class="field__label" for="coPhone">Phone (for delivery partner)</label>' +
              '<input class="field__input" id="coPhone" type="tel" name="phone" autocomplete="tel" placeholder="10-digit mobile" inputmode="numeric" maxlength="15">' +
              '<span class="field__error" role="alert"></span>' +
            '</div>' +
            summaryHTML() +
            '<button class="btn btn--primary btn--block" data-checkout-submit type="submit">Continue to payment</button>' +
            '<p class="auth-note">Your order is recorded in your account when you\u2019re signed in.</p>' +
          '</form>' +
        '</div>' +
      '</div>'
    );
  }

  function isOpen() {
    return els.modal && els.modal.classList.contains('is-open');
  }

  function open() {
    if (!Cart.count()) return;

    if (!backendActive()) {
      UI.toast('Checkout needs the backend connection — see SETUP.md to enable it.', 'info');
      return;
    }
    if (isOpen()) return;

    lastFocus = document.activeElement;
    mount();

    els.overlay.hidden = false;
    els.modal.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(function () {
      els.overlay.classList.add('is-open');
      els.modal.classList.add('is-open');
    });
    els.modal.setAttribute('aria-hidden', 'false');

    var first = els.modal.querySelector('#coName');
    if (first) first.focus();
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

  /* ------------------------------------------------------------------ */
  /*  Field validation (shared pattern with forms.js)                   */
  /* ------------------------------------------------------------------ */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function setError(input, message) {
    var field = input.closest('.field') || input.parentNode;
    field.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    var slot = field.querySelector('.field__error');
    if (slot) slot.textContent = message || '';
  }

  function readFields() {
    return {
      name: (els.form.querySelector('#coName').value || '').trim(),
      email: (els.form.querySelector('#coEmail').value || '').trim(),
      phone: (els.form.querySelector('#coPhone').value || '').trim()
    };
  }

  function validFields() {
    var c = readFields();
    var firstBad = null;
    if (!c.name || c.name.length < 2) {
      setError(els.form.querySelector('#coName'), 'Please enter your name.');
      firstBad = firstBad || els.form.querySelector('#coName');
    } else setError(els.form.querySelector('#coName'), '');
    if (!EMAIL_RE.test(c.email)) {
      setError(els.form.querySelector('#coEmail'), 'Enter a valid email address.');
      firstBad = firstBad || els.form.querySelector('#coEmail');
    } else setError(els.form.querySelector('#coEmail'), '');
    if (c.phone && !/^[0-9+\-\s]{6,20}$/.test(c.phone)) {
      setError(els.form.querySelector('#coPhone'), 'Enter a valid phone number.');
      firstBad = firstBad || els.form.querySelector('#coPhone');
    } else setError(els.form.querySelector('#coPhone'), '');

    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  /* ------------------------------------------------------------------ */
  /*  Order flow                                                        */
  /* ------------------------------------------------------------------ */

  function loadRazorpaySDK() {
    return new Promise(function (resolve, reject) {
      if (window.Razorpay) return resolve();
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('razorpay-cdn-unavailable')); };
      document.head.appendChild(s);
    });
  }

  function setBusy(on) {
    busy = on;
    var btn = els.submit;
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle('is-busy', on);
    btn.textContent = on ? 'Processing\u2026' : 'Continue to payment';
  }

  function placeOrder() {
    if (busy) return;
    if (!validFields()) return;

    var customer = readFields();
    var items = Cart.items().map(function (it) {
      return { id: it.id, qty: it.qty };
    });

    setBusy(true);
    Supa.createOrder({ items: items, customer: customer })
      .then(function (res) { return startPayment(res, customer); })
      .catch(function (err) {
        var msg = (err && err.message) === 'razorpay-cdn-unavailable'
          ? 'Could not load the payment window (offline network?). Your bag is safe — try again.'
          : ((err && err.message && err.message.indexOf('backend-not-ready') === -1)
              ? err.message
              : 'Checkout is not connected yet — see SETUP.md.');
        UI.toast(msg, 'error');
        setBusy(false);
      });
  }

  function startPayment(res, customer) {
    if (!res) throw new Error('No order from server.');

    if (res.mode === 'manual') {
      setBusy(false);
      Cart.clear(true);
      close();
      UI.toast(
        'Order #' + res.reference + ' placed \u2014 no payment taken. We\u2019ll email your confirmation.',
        'success'
      );
      return Promise.resolve();
    }

    if (res.mode !== 'razorpay' || !res.razorpayKeyId || !res.orderId) {
      setBusy(false);
      throw new Error('Payment gateway returned an invalid response.');
    }

    return loadRazorpaySDK().then(function () {
      return new Promise(function (resolve) {
        var rzp = new window.Razorpay({
          key: res.razorpayKeyId,
          amount: res.amountPaise,
          currency: 'INR',
          name: 'Aurelia Lab',
          description: 'Skincare order \u2014 ' + formatPrice(res.amount),
          order_id: res.orderId,
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone || undefined
          },
          theme: { color: '#27624b' },
          handler: function (r) {
            verifyPayment(r);
            resolve();
          },
          modal: {
            ondismiss: function () {
              setBusy(false);
              UI.toast('Payment cancelled \u2014 your bag is safe.', 'info');
              resolve();
            }
          }
        });
        rzp.open();
      });
    });
  }

  function verifyPayment(r) {
    setBusy(false);
    Supa.verifyPayment({
      order_id: r.razorpay_order_id,
      payment_id: r.razorpay_payment_id,
      signature: r.razorpay_signature
    }).then(function (res) {
      if (res && res.ok) {
        Cart.clear(true);
        close();
        UI.toast('Payment successful \u2014 order confirmed. Thank you!', 'success');
      } else {
        UI.toast('Payment received, but we couldn\u2019t confirm it yet. We\u2019ll email you shortly.', 'error');
      }
    }).catch(function () {
      UI.toast('Could not confirm payment right now. We\u2019ll email you shortly.', 'error');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Mount                                                             */
  /* ------------------------------------------------------------------ */

  function mount() {
    if (document.querySelector('[data-checkout-modal]')) return;

    var holder = document.createElement('div');
    holder.innerHTML = modalHTML();
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    els.modal = document.querySelector('[data-checkout-modal]');
    els.overlay = document.querySelector('[data-checkout-overlay]');
    els.form = els.modal.querySelector('[data-checkout-form]');
    els.submit = els.modal.querySelector('[data-checkout-submit]');

    els.overlay.addEventListener('click', close);
    els.modal.querySelector('[data-checkout-close]').addEventListener('click', close);

    els.submit.addEventListener('click', function (event) {
      event.preventDefault();
      placeOrder();
    });

    els.form.addEventListener('submit', function (event) {
      event.preventDefault();
      placeOrder();
    });

    Array.prototype.forEach.call(els.form.querySelectorAll('input'), function (input) {
      input.addEventListener('blur', function () {
        var v = (input.value || '').trim();
        if (input.id === 'coName' && v && v.length < 2) setError(input, 'Please enter your name.');
        else if (input.id === 'coEmail' && v && !EMAIL_RE.test(v)) setError(input, 'Enter a valid email address.');
        else if (input.id === 'coPhone' && v && !/^[0-9+\-\s]{6,20}$/.test(v)) setError(input, 'Enter a valid phone number.');
        else setError(input, '');
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen() && !busy) close();
    });
  }

  function init() {
    mount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    open: open,
    close: close,
    isOpen: isOpen
  };
})();