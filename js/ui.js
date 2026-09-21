/* ==========================================================================
   AURELIA LAB — ui.js
   Shared UI helpers: generated SVG packaging art, star ratings, toasts,
   scroll reveal, mobile navigation.
   ========================================================================== */

var UI = (function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Escaping                                                          */
  /* ------------------------------------------------------------------ */

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Generated product artwork                                         */
  /*  Every product gets a deterministic inline SVG vessel, so no image  */
  /*  files or network requests are ever required.                      */
  /* ------------------------------------------------------------------ */

  function slug(value) {
    return String(value).replace(/[^a-z0-9]/gi, '');
  }

  function vesselMarkup(shape, uid, h, v) {
    var glass = 'url(#gl-' + uid + ')';
    var cap = 'url(#cap-' + uid + ')';
    var liquid = 'url(#lq-' + uid + ')';
    var edge = 'hsl(' + h + ' 18% 80%)';
    var shade = 'hsl(' + h + ' 20% 30%)';
    var label = 'hsl(' + h + ' 26% 98%)';
    var labelInk = 'hsl(' + h + ' 20% 72%)';
    var labelInk2 = 'hsl(' + h + ' 22% 82%)';
    var accent = 'hsl(' + h + ' 30% 58%)';
    var out = '';

    function labelBlock(x, y, w) {
      return (
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="86" rx="2" fill="' + label + '"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 16) + '" width="' + (w - 34) + '" height="4" rx="2" fill="' + labelInk + '"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 30) + '" width="' + (w - 48) + '" height="3" rx="1.5" fill="' + labelInk2 + '"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 41) + '" width="' + (w - 42) + '" height="3" rx="1.5" fill="' + labelInk2 + '"/>' +
        '<rect x="' + (x + 12) + '" y="' + (y + 58) + '" width="24" height="7" rx="3.5" fill="' + accent + '"/>'
      );
    }

    function highlight(x, y, hgt) {
      return '<rect x="' + x + '" y="' + y + '" width="9" height="' + hgt + '" rx="4.5" fill="#ffffff" opacity=".55"/>';
    }

    if (shape === 'dropper') {
      out +=
        '<clipPath id="cl-' + uid + '"><rect x="112" y="150" width="96" height="205" rx="16"/></clipPath>' +
        '<rect x="112" y="150" width="96" height="205" rx="16" fill="' + glass + '"/>' +
        '<rect x="112" y="212" width="96" height="143" fill="' + liquid + '" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="112" y="212" width="96" height="6" fill="hsl(' + h + ' 42% 82%)" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="112" y="150" width="96" height="205" rx="16" fill="none" stroke="' + edge + '" stroke-width="1.5"/>' +
        '<rect x="140" y="118" width="40" height="36" rx="4" fill="hsl(' + h + ' 24% 90%)"/>' +
        '<rect x="152" y="118" width="16" height="46" rx="3" fill="hsl(' + h + ' 22% 84%)"/>' +
        '<rect x="132" y="64" width="56" height="58" rx="10" fill="' + cap + '"/>' +
        '<rect x="132" y="64" width="56" height="11" rx="5" fill="hsl(' + h + ' 16% 36%)" opacity=".75"/>' +
        labelBlock(124, 238, 72) +
        highlight(124, 162, 62);
    } else if (shape === 'pump') {
      out +=
        '<clipPath id="cl-' + uid + '"><rect x="114" y="156" width="92" height="199" rx="12"/></clipPath>' +
        '<rect x="114" y="156" width="92" height="199" rx="12" fill="' + glass + '"/>' +
        '<rect x="114" y="196" width="92" height="159" fill="' + liquid + '" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="114" y="196" width="92" height="6" fill="hsl(' + h + ' 42% 82%)" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="114" y="156" width="92" height="199" rx="12" fill="none" stroke="' + edge + '" stroke-width="1.5"/>' +
        '<rect x="146" y="126" width="28" height="32" fill="hsl(' + h + ' 24% 90%)"/>' +
        '<rect x="138" y="98" width="44" height="30" rx="7" fill="' + cap + '"/>' +
        '<rect x="176" y="106" width="34" height="14" rx="7" fill="' + cap + '"/>' +
        '<rect x="138" y="98" width="44" height="8" rx="4" fill="hsl(' + h + ' 16% 36%)" opacity=".7"/>' +
        labelBlock(126, 232, 68) +
        highlight(126, 168, 56);
    } else if (shape === 'tube') {
      out +=
        '<clipPath id="cl-' + uid + '"><rect x="118" y="118" width="84" height="224" rx="10"/></clipPath>' +
        '<rect x="118" y="118" width="84" height="224" rx="10" fill="' + glass + '"/>' +
        '<rect x="118" y="164" width="84" height="178" fill="' + liquid + '" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="118" y="164" width="84" height="5" fill="hsl(' + h + ' 42% 82%)" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="118" y="118" width="84" height="224" rx="10" fill="none" stroke="' + edge + '" stroke-width="1.5"/>' +
        '<rect x="110" y="330" width="100" height="16" rx="3" fill="hsl(' + h + ' 22% 84%)"/>' +
        '<rect x="120" y="333" width="2" height="10" fill="hsl(' + h + ' 18% 70%)"/>' +
        '<rect x="140" y="333" width="2" height="10" fill="hsl(' + h + ' 18% 70%)"/>' +
        '<rect x="160" y="333" width="2" height="10" fill="hsl(' + h + ' 18% 70%)"/>' +
        '<rect x="180" y="333" width="2" height="10" fill="hsl(' + h + ' 18% 70%)"/>' +
        '<rect x="198" y="333" width="2" height="10" fill="hsl(' + h + ' 18% 70%)"/>' +
        '<rect x="134" y="66" width="52" height="52" rx="9" fill="' + cap + '"/>' +
        '<rect x="134" y="66" width="52" height="10" rx="5" fill="hsl(' + h + ' 16% 36%)" opacity=".7"/>' +
        labelBlock(128, 196, 64) +
        highlight(128, 130, 54);
    } else if (shape === 'jar') {
      out +=
        '<rect x="88" y="150" width="144" height="50" rx="16" fill="' + cap + '"/>' +
        '<rect x="88" y="150" width="144" height="12" rx="6" fill="hsl(' + h + ' 16% 36%)" opacity=".7"/>' +
        '<rect x="96" y="196" width="128" height="136" rx="20" fill="' + glass + '"/>' +
        '<rect x="96" y="196" width="128" height="136" rx="20" fill="none" stroke="' + edge + '" stroke-width="1.5"/>' +
        '<rect x="112" y="222" width="96" height="76" rx="2" fill="' + label + '"/>' +
        '<rect x="124" y="238" width="60" height="4" rx="2" fill="' + labelInk + '"/>' +
        '<rect x="124" y="252" width="44" height="3" rx="1.5" fill="' + labelInk2 + '"/>' +
        '<rect x="124" y="263" width="52" height="3" rx="1.5" fill="' + labelInk2 + '"/>' +
        '<rect x="124" y="278" width="26" height="7" rx="3.5" fill="' + accent + '"/>' +
        highlight(106, 214, 44);
    } else {
      /* bottle */
      out +=
        '<clipPath id="cl-' + uid + '"><rect x="118" y="140" width="84" height="212" rx="18"/></clipPath>' +
        '<rect x="118" y="140" width="84" height="212" rx="18" fill="' + glass + '"/>' +
        '<rect x="118" y="184" width="84" height="168" fill="' + liquid + '" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="118" y="184" width="84" height="5" fill="hsl(' + h + ' 42% 82%)" clip-path="url(#cl-' + uid + ')"/>' +
        '<rect x="118" y="140" width="84" height="212" rx="18" fill="none" stroke="' + edge + '" stroke-width="1.5"/>' +
        '<rect x="144" y="106" width="32" height="36" fill="hsl(' + h + ' 24% 90%)"/>' +
        '<rect x="136" y="60" width="48" height="50" rx="9" fill="' + cap + '"/>' +
        '<rect x="136" y="60" width="48" height="10" rx="5" fill="hsl(' + h + ' 16% 36%)" opacity=".7"/>' +
        labelBlock(126, 212, 68) +
        highlight(126, 152, 50);
    }

    out += '<ellipse cx="160" cy="366" rx="84" ry="11" fill="' + shade + '" opacity=".1"/>';
    return out;
  }

  function productArt(product, options) {
    options = options || {};
    var variant = options.variant || 0;
    var h = product.hue;
    var uid = slug(product.id) + variant;
    var alt = options.alt || (product.name + ' packaging');

    var defs =
      '<defs>' +
        '<linearGradient id="bg-' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="hsl(' + h + ' 26% 97%)"/>' +
          '<stop offset="1" stop-color="hsl(' + (h + 18) + ' 20% 89%)"/>' +
        '</linearGradient>' +
        '<linearGradient id="gl-' + uid + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="hsl(' + h + ' 32% 99%)"/>' +
          '<stop offset="0.45" stop-color="hsl(' + h + ' 24% 94%)"/>' +
          '<stop offset="1" stop-color="hsl(' + h + ' 20% 86%)"/>' +
        '</linearGradient>' +
        '<linearGradient id="lq-' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="hsl(' + h + ' 40% ' + (76 - variant * 5) + '%)"/>' +
          '<stop offset="1" stop-color="hsl(' + (h + 12) + ' 34% ' + (58 - variant * 4) + '%)"/>' +
        '</linearGradient>' +
        '<linearGradient id="cap-' + uid + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="hsl(' + h + ' 14% 30%)"/>' +
          '<stop offset="0.5" stop-color="hsl(' + h + ' 14% 20%)"/>' +
          '<stop offset="1" stop-color="hsl(' + h + ' 14% 13%)"/>' +
        '</linearGradient>' +
      '</defs>';

    return (
      '<svg class="art" viewBox="0 0 320 400" role="img" aria-label="' + esc(alt) + '" ' +
        'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
        defs +
        '<rect width="320" height="400" fill="url(#bg-' + uid + ')"/>' +
        '<circle cx="160" cy="216" r="126" fill="hsl(' + h + ' 34% 100%)" opacity=".55"/>' +
        '<circle cx="160" cy="216" r="126" fill="none" stroke="hsl(' + h + ' 22% 84%)" stroke-width="1"/>' +
        vesselMarkup(product.shape, uid, h, variant) +
      '</svg>'
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Star ratings                                                      */
  /* ------------------------------------------------------------------ */

  function starsHTML(rating) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      var kind = rating >= i - 0.25 ? 'full' : rating >= i - 0.75 ? 'half' : 'empty';
      out += '<span class="star star--' + kind + '">\u2605</span>';
    }
    return '<span class="stars" role="img" aria-label="' +
      rating.toFixed(1) + ' out of 5 stars">' + out + '</span>';
  }

  /* ------------------------------------------------------------------ */
  /*  Toasts                                                            */
  /* ------------------------------------------------------------------ */

  var toastStack = null;

  function ensureToastStack() {
    if (toastStack) return toastStack;
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    toastStack.setAttribute('role', 'status');
    toastStack.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastStack);
    return toastStack;
  }

  function toast(message, type, action) {
    type = type || 'success';
    var stack = ensureToastStack();
    var el = document.createElement('div');
    el.className = 'toast toast--' + type;

    var icon = type === 'error' ? '\u2715' : type === 'info' ? '\u2139' : '\u2713';
    el.innerHTML =
      '<span class="toast__icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="toast__text">' + esc(message) + '</span>' +
      (action ? '<button type="button" class="toast__action">' + esc(action.label) + '</button>' : '') +
      '<button type="button" class="toast__close" aria-label="Dismiss notification">\u2715</button>';

    function dismiss() {
      el.classList.add('is-leaving');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }

    el.querySelector('.toast__close').addEventListener('click', dismiss);
    if (action) {
      el.querySelector('.toast__action').addEventListener('click', function () {
        action.onClick();
        dismiss();
      });
    }

    stack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    setTimeout(dismiss, action ? 6000 : 3800);
    return el;
  }

  /* ------------------------------------------------------------------ */
  /*  Scroll reveal                                                     */
  /* ------------------------------------------------------------------ */

  function initReveal(root) {
    var targets = (root || document).querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = Number(el.getAttribute('data-reveal-delay') || 0);
        setTimeout(function () { el.classList.add('is-revealed'); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /*  Header: mobile nav + scrolled state                               */
  /* ------------------------------------------------------------------ */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) close();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Newsletter form (present in the footer of every page)              */
  /* ------------------------------------------------------------------ */

  function initNewsletter() {
    var form = document.querySelector('[data-newsletter]');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var field = input.closest('.field') || input.parentNode;
      var value = input.value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);

      field.classList.toggle('has-error', !valid);
      var error = field.querySelector('.field__error');
      if (error) error.textContent = valid ? '' : 'Enter a valid email address.';
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid) { input.focus(); return; }

      form.reset();
      toast('You\u2019re on the list. Watch for 10% off your first order.', 'success');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                              */
  /* ------------------------------------------------------------------ */

  function init() {
    initHeader();
    initReveal();
    initNewsletter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    esc: esc,
    productArt: productArt,
    starsHTML: starsHTML,
    toast: toast,
    initReveal: initReveal,
    initHeader: initHeader
  };
})();
