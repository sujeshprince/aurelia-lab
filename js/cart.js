/* ==========================================================================
   AURELIA LAB — cart.js
   localStorage-backed bag with an injected slide-out drawer.
   Depends on: data.js (PRODUCTS, getProduct, formatPrice), ui.js (UI)
   ========================================================================== */

var Cart = (function () {
  'use strict';

  var STORAGE_KEY = 'skincare.cart.v1';
  var FREE_SHIPPING = 1999;

  var items = [];
  var listeners = [];
  var els = {};
  var lastFocus = null;

  /* ------------------------------------------------------------------ */
  /*  Persistence                                                       */
  /* ------------------------------------------------------------------ */

  function load() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      raw = null;
    }

    var parsed = [];
    if (raw) {
      try { parsed = JSON.parse(raw) || []; } catch (err) { parsed = []; }
    }

    items = parsed
      .filter(function (item) {
        return item && getProduct(item.id) && Number(item.qty) > 0;
      })
      .map(function (item) {
        return { id: item.id, qty: Math.min(99, Math.floor(Number(item.qty))) };
      });
  }

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      /* Storage unavailable (private mode / disabled) — cart stays in memory. */
    }
  }

  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */

  function count() {
    return items.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function subtotal() {
    return items.reduce(function (sum, item) {
      var product = getProduct(item.id);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
  }

  function qtyOf(id) {
    var found = items.filter(function (item) { return item.id === id; })[0];
    return found ? found.qty : 0;
  }

  function add(id, qty, opts) {
    var product = getProduct(id);
    if (!product) return;
    qty = Math.max(1, Math.floor(qty || 1));
    opts = opts || {};

    var existing = items.filter(function (item) { return item.id === id; })[0];
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
    } else {
      items.push({ id: id, qty: qty });
    }
    commit();
    if (!opts.silent) {
      UI.toast(product.name + ' added to your bag.', 'success', {
        label: 'View bag',
        onClick: open
      });
    }
    bumpBadge();
  }

  function setQty(id, qty) {
    qty = Math.floor(qty);
    if (qty <= 0) return remove(id);
    var existing = items.filter(function (item) { return item.id === id; })[0];
    if (!existing) return;
    existing.qty = Math.min(99, qty);
    commit();
  }

  function remove(id) {
    var product = getProduct(id);
    items = items.filter(function (item) { return item.id !== id; });
    commit();
    if (product) UI.toast(product.name + ' removed from your bag.', 'info');
  }

  function clear(silent) {
    if (!items.length) return;
    items = [];
    commit();
    if (!silent) UI.toast('Your bag is now empty.', 'info');
  }

  function commit() {
    save();
    render();
    notify();
  }

  function notify() {
    updateBadge();
    listeners.forEach(function (fn) { fn(snapshot()); });
  }

  function snapshot() {
    return items.map(function (item) {
      return { id: item.id, qty: item.qty, product: getProduct(item.id) };
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Badge                                                             */
  /* ------------------------------------------------------------------ */

  function updateBadge() {
    var total = count();
    var badges = document.querySelectorAll('[data-cart-count]');
    Array.prototype.forEach.call(badges, function (badge) {
      badge.textContent = total;
      badge.setAttribute('data-empty', String(total === 0));
      badge.setAttribute('aria-hidden', total === 0 ? 'true' : 'false');
    });

    var labels = document.querySelectorAll('[data-cart-count-label]');
    Array.prototype.forEach.call(labels, function (label) {
      label.textContent = total === 0 ? '' : '(' + total + ')';
    });
  }

  function bumpBadge() {
    var badges = document.querySelectorAll('[data-cart-count]');
    Array.prototype.forEach.call(badges, function (badge) {
      badge.classList.remove('is-bumped');
      /* force reflow so the animation can replay */
      void badge.offsetWidth;
      badge.classList.add('is-bumped');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Drawer markup                                                     */
  /* ------------------------------------------------------------------ */

  function drawerHTML() {
    return '' +
      '<div class="drawer-overlay" data-cart-overlay hidden></div>' +
      '<aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" ' +
        'aria-labelledby="cartDrawerTitle" aria-hidden="true" hidden>' +
        '<div class="cart-drawer__head">' +
          '<h2 id="cartDrawerTitle">Your bag <span class="cart-drawer__count" data-cart-count-label></span></h2>' +
          '<button type="button" class="icon-btn" data-cart-close aria-label="Close bag">\u2715</button>' +
        '</div>' +
        '<div class="cart-drawer__body" data-cart-body></div>' +
        '<div class="cart-drawer__foot" data-cart-foot>' +
          '<div class="cart-total"><span>Subtotal</span><strong data-cart-subtotal>\u20b90</strong></div>' +
          '<p class="cart-note">Shipping and taxes calculated at checkout. Free delivery over ' + formatPrice(FREE_SHIPPING) + '.</p>' +
          '<button type="button" class="btn btn--primary btn--block" data-cart-checkout>Checkout</button>' +
          '<button type="button" class="link-btn" data-cart-clear>Empty bag</button>' +
        '</div>' +
      '</aside>';
  }

  function shippingBlockHTML(total) {
    var remaining = Math.max(0, FREE_SHIPPING - total);
    var pct = Math.min(100, (total / FREE_SHIPPING) * 100);
    var message = remaining > 0
      ? 'You\u2019re <strong>' + formatPrice(remaining) + '</strong> away from free delivery.'
      : '<strong>Free delivery unlocked.</strong>';

    return '' +
      '<div class="cart-shipping">' +
        '<p class="cart-shipping__label">' + message + '</p>' +
        '<div class="cart-shipping__track"><div class="cart-shipping__fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
  }

  function lineHTML(item) {
    var product = item.product;
    return '' +
      '<div class="cart-line" data-line="' + product.id + '">' +
        '<div class="cart-line__art">' + UI.productArt(product, { variant: 1 }) + '</div>' +
        '<div>' +
          '<div class="cart-line__top">' +
            '<div>' +
              '<p class="cart-line__name">' + UI.esc(product.name) + '</p>' +
              '<p class="cart-line__meta">' + UI.esc(product.category) + ' \u00b7 ' + UI.esc(product.size) + '</p>' +
            '</div>' +
            '<span class="cart-line__price">' + formatPrice(product.price * item.qty) + '</span>' +
          '</div>' +
          '<div class="cart-line__foot">' +
            '<div class="qty" role="group" aria-label="Quantity for ' + UI.esc(product.name) + '">' +
              '<button type="button" class="qty__btn" data-qty-down aria-label="Decrease quantity">\u2212</button>' +
              '<span class="qty__value" data-qty-value>' + item.qty + '</span>' +
              '<button type="button" class="qty__btn" data-qty-up aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="cart-line__remove" data-remove>Remove</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function render() {
    if (!els.body) return;

    var total = subtotal();

    if (!items.length) {
      els.body.innerHTML =
        shippingBlockHTML(0) +
        '<div class="cart-empty">' +
          '<div class="cart-empty__mark" aria-hidden="true">\u25c7</div>' +
          '<p>Your bag is empty.<br>Start with a cleanser or a serum.</p>' +
          '<a class="btn btn--ghost btn--sm" href="shop.html">Browse the range</a>' +
        '</div>';
      if (els.foot) els.foot.style.display = 'none';
      return;
    }

    els.body.innerHTML = shippingBlockHTML(total) + items.map(function (item) {
      return lineHTML({ id: item.id, qty: item.qty, product: getProduct(item.id) });
    }).join('');

    if (els.foot) els.foot.style.display = '';

    var subtotalEl = els.drawer.querySelector('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatPrice(total);

    bindLines();
  }

  function bindLines() {
    Array.prototype.forEach.call(els.body.querySelectorAll('[data-line]'), function (line) {
      var id = line.getAttribute('data-line');
      line.querySelector('[data-qty-up]').addEventListener('click', function () {
        setQty(id, qtyOf(id) + 1);
      });
      line.querySelector('[data-qty-down]').addEventListener('click', function () {
        setQty(id, qtyOf(id) - 1);
      });
      line.querySelector('[data-remove]').addEventListener('click', function () {
        remove(id);
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Open / close                                                      */
  /* ------------------------------------------------------------------ */

  function isOpen() {
    return els.drawer && els.drawer.classList.contains('is-open');
  }

  function open() {
    if (!els.drawer || isOpen()) return;
    lastFocus = document.activeElement;
    els.overlay.hidden = false;
    els.drawer.hidden = false;
    document.body.classList.add('drawer-open');
    requestAnimationFrame(function () {
      els.overlay.classList.add('is-open');
      els.drawer.classList.add('is-open');
    });
    els.drawer.setAttribute('aria-hidden', 'false');
    var closeBtn = els.drawer.querySelector('[data-cart-close]');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!els.drawer || !isOpen()) return;
    els.drawer.classList.remove('is-open');
    els.overlay.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');

    setTimeout(function () {
      if (els.drawer && !els.drawer.classList.contains('is-open')) {
        els.drawer.hidden = true;
        els.overlay.hidden = true;
      }
    }, 340);

    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggle() {
    if (isOpen()) close(); else open();
  }

  function trapFocus(event) {
    if (!isOpen() || event.key !== 'Tab') return;
    var focusable = els.drawer.querySelectorAll(
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
  /*  Mount                                                             */
  /* ------------------------------------------------------------------ */

  function mount() {
    if (document.getElementById('cartDrawer')) return;

    var holder = document.createElement('div');
    holder.innerHTML = drawerHTML();
    while (holder.firstChild) document.body.appendChild(holder.firstChild);

    els.drawer = document.getElementById('cartDrawer');
    els.overlay = document.querySelector('[data-cart-overlay]');
    els.body = els.drawer.querySelector('[data-cart-body]');
    els.foot = els.drawer.querySelector('[data-cart-foot]');

    els.overlay.addEventListener('click', close);
    els.drawer.querySelector('[data-cart-close]').addEventListener('click', close);
    els.drawer.querySelector('[data-cart-clear]').addEventListener('click', function () {
      clear();
    });
    els.drawer.querySelector('[data-cart-checkout]').addEventListener('click', function () {
      if (!items.length) return;
      UI.toast('This is a demo storefront \u2014 checkout is not connected.', 'info');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
      trapFocus(event);
    });

    /* Any element with data-cart-open opens the drawer. */
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-cart-open]');
      if (!trigger) return;
      event.preventDefault();
      open();
    });

    /* Delegated add-to-cart for any [data-add-to-cart="product-id"] */
    document.addEventListener('click', function (event) {
      var button = event.target.closest('[data-add-to-cart]');
      if (!button) return;
      event.preventDefault();
      var id = button.getAttribute('data-add-to-cart');
      var qtyInput = button.getAttribute('data-qty-source');
      var qty = 1;
      if (qtyInput) {
        var source = document.querySelector(qtyInput);
        if (source) qty = Math.max(1, parseInt(source.textContent || source.value, 10) || 1);
      }
      add(id, qty);
      button.classList.add('is-added');
      setTimeout(function () { button.classList.remove('is-added'); }, 900);
    });

    render();
    updateBadge();
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                        */
  /* ------------------------------------------------------------------ */

  function init() {
    load();
    mount();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    count: count,
    subtotal: subtotal,
    qtyOf: qtyOf,
    items: snapshot,
    open: open,
    close: close,
    toggle: toggle,
    render: render,
    updateBadge: updateBadge,
    onChange: function (fn) { listeners.push(fn); fn(snapshot()); }
  };
})();
