/* ==========================================================================
   AURELIA LAB — forms.js
   Contact form validation + FAQ accordion.
   Depends on: ui.js (UI.toast)
   ========================================================================== */

(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* ------------------------------------------------------------------ */
  /*  Validation helpers                                                */
  /* ------------------------------------------------------------------ */

  function fieldOf(control) {
    return control.closest('.field') || control.parentNode;
  }

  function setError(control, message) {
    var field = fieldOf(control);
    field.classList.toggle('has-error', Boolean(message));
    control.setAttribute('aria-invalid', String(Boolean(message)));

    var slot = field.querySelector('.field__error');
    if (slot) slot.textContent = message || '';
  }

  function valueOf(control) {
    if (control.type === 'checkbox') return control.checked ? 'on' : '';
    return (control.value || '').trim();
  }

  function validateControl(control) {
    var value = valueOf(control);

    if (control.hasAttribute('required') && !value) {
      setError(control, control.type === 'checkbox'
        ? 'Please confirm before sending.'
        : 'This field is required.');
      return false;
    }

    if (control.type === 'email' && value && !EMAIL_RE.test(value)) {
      setError(control, 'Enter a valid email address, for example name@domain.com.');
      return false;
    }

    if (control.id === 'cName' && value && value.length < 2) {
      setError(control, 'Please enter your name.');
      return false;
    }

    if (control.id === 'cMessage' && value && value.length < 12) {
      setError(control, 'Tell us a little more — at least a sentence.');
      return false;
    }

    setError(control, '');
    return true;
  }

  /* ------------------------------------------------------------------ */
  /*  Contact form                                                      */
  /* ------------------------------------------------------------------ */

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var controls = form.querySelectorAll('input, select, textarea');
    var submit = form.querySelector('button[type="submit"]');

    /* Validate on blur, then live once a field has been touched. */
    Array.prototype.forEach.call(controls, function (control) {
      control.addEventListener('blur', function () { validateControl(control); });
      control.addEventListener('input', function () {
        if (fieldOf(control).classList.contains('has-error')) validateControl(control);
      });
      control.addEventListener('change', function () {
        if (control.tagName === 'SELECT' || control.type === 'checkbox') validateControl(control);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var firstInvalid = null;
      Array.prototype.forEach.call(controls, function (control) {
        var valid = validateControl(control);
        if (!valid && !firstInvalid) firstInvalid = control;
      });

      if (firstInvalid) {
        UI.toast('Please correct the highlighted fields.', 'error');
        firstInvalid.focus();
        return;
      }

      var name = (document.getElementById('cName').value || '').trim().split(' ')[0];
      var original = submit.textContent;

      submit.disabled = true;
      submit.textContent = 'Sending…';

      /* Demo storefront: no network request, just a convincing confirmation. */
      setTimeout(function () {
        submit.disabled = false;
        submit.textContent = original;
        form.reset();
        Array.prototype.forEach.call(controls, function (control) { setError(control, ''); });
        UI.toast('Thanks ' + (name || 'there') + ' — your message is with our formulation team.', 'success');
      }, 700);
    });
  }

  /* ------------------------------------------------------------------ */
  /*  FAQ accordion                                                     */
  /* ------------------------------------------------------------------ */

  function initFAQ() {
    var items = document.querySelectorAll('.faq__item');
    if (!items.length) return;

    Array.prototype.forEach.call(items, function (item) {
      var button = item.querySelector('.faq__q');
      var panel = item.querySelector('.faq__a');
      if (!button || !panel) return;

      button.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        /* Accordion behaviour: only one panel open at a time. */
        Array.prototype.forEach.call(items, function (other) {
          other.classList.remove('is-open');
          var otherPanel = other.querySelector('.faq__a');
          var otherButton = other.querySelector('.faq__q');
          if (otherPanel) otherPanel.style.maxHeight = null;
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        });

        if (isOpen) return;

        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        button.setAttribute('aria-expanded', 'true');
      });
    });

    /* Keep an open panel correctly sized when the viewport changes. */
    window.addEventListener('resize', function () {
      Array.prototype.forEach.call(items, function (item) {
        if (!item.classList.contains('is-open')) return;
        var panel = item.querySelector('.faq__a');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      });
    });

    /* Deep link support: contact.html#faq should still open cleanly. */
    var hash = window.location.hash;
    if (hash && hash !== '#faq') {
      var target = document.querySelector(hash);
      if (target && target.closest('.faq__item')) target.click();
    }
  }

  /* ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();
    initFAQ();
  });
})();
