/* ==========================================================================
   AURELIA LAB — product.js
   Renders the product detail page from the ?id= query parameter.
   Depends on: data.js, ui.js, cart.js, home.js (window.renderCard)
   ========================================================================== */

(function () {
  'use strict';

  var root = document.getElementById('pdpRoot');
  var notFound = document.getElementById('notFound');

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function activesHTML(product) {
    if (!product.actives.length) return '';
    return '' +
      '<div class="actives">' +
        '<div class="actives__head"><span>Key actives</span><span>Concentration</span></div>' +
        '<div class="actives__list">' +
          product.actives.map(function (active) {
            return '<div class="active-item">' +
              '<strong>' + UI.esc(active.pct) + '</strong>' +
              '<span>' + UI.esc(active.name) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function tabsHTML(product) {
    return '' +
      '<div class="tabs" data-tabs>' +
        '<div class="tabs__nav" role="tablist" aria-label="Product details">' +
          '<button type="button" class="tabs__btn is-active" role="tab" aria-selected="true" ' +
            'aria-controls="panel-description" id="tab-description">Description</button>' +
          '<button type="button" class="tabs__btn" role="tab" aria-selected="false" ' +
            'aria-controls="panel-ingredients" id="tab-ingredients">Full ingredients</button>' +
          '<button type="button" class="tabs__btn" role="tab" aria-selected="false" ' +
            'aria-controls="panel-usage" id="tab-usage">How to use</button>' +
        '</div>' +

        '<div class="tabs__panel" id="panel-description" role="tabpanel" aria-labelledby="tab-description">' +
          '<p>' + UI.esc(product.description) + '</p>' +
          '<p class="mono muted" style="margin-top:22px;">Best for: ' +
            product.concerns.map(UI.esc).join(' · ') + '</p>' +
        '</div>' +

        '<div class="tabs__panel" id="panel-ingredients" role="tabpanel" aria-labelledby="tab-ingredients" hidden>' +
          '<p class="mono muted" style="margin-bottom:16px;">Full INCI list</p>' +
          '<p>' + UI.esc(product.ingredients) + '</p>' +
          '<p class="muted" style="margin-top:20px;font-size:13.5px;">' +
            'Fragrance free · Essential-oil free · Silicone free where stated · Not tested on animals.' +
          '</p>' +
        '</div>' +

        '<div class="tabs__panel" id="panel-usage" role="tabpanel" aria-labelledby="tab-usage" hidden>' +
          '<ol>' +
            product.steps.map(function (step) { return '<li>' + UI.esc(step) + '</li>'; }).join('') +
          '</ol>' +
        '</div>' +
      '</div>';
  }

  function render(product) {
    var related = PRODUCTS.filter(function (p) {
      if (p.id === product.id) return false;
      var shared = p.concerns.some(function (c) { return product.concerns.indexOf(c) !== -1; });
      return shared || p.category === product.category;
    }).slice(0, 3);

    root.innerHTML = '' +
      '<div class="container">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb" style="padding-top:34px;">' +
          '<a href="index.html">Home</a>' +
          '<span aria-hidden="true">/</span>' +
          '<a href="shop.html">Shop all</a>' +
          '<span aria-hidden="true">/</span>' +
          '<a href="shop.html?category=' + encodeURIComponent(product.category) + '">' +
            UI.esc(product.category) + '</a>' +
          '<span aria-hidden="true">/</span>' +
          '<span aria-current="page">' + UI.esc(product.name) + '</span>' +
        '</nav>' +

        '<div class="pdp">' +
          '<div class="pdp__gallery">' +
            '<div class="pdp__stage" id="pdpStage">' + UI.productArt(product) + '</div>' +
            '<div class="pdp__thumbs" role="group" aria-label="Product images">' +
              [0, 1, 2].map(function (variant) {
                return '<button type="button" class="pdp__thumb' + (variant === 0 ? ' is-active' : '') +
                  '" data-variant="' + variant + '" aria-label="View image ' + (variant + 1) + '">' +
                  UI.productArt(product, { variant: variant }) + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="pdp__info">' +
            '<p class="pdp__cat">' + UI.esc(product.category) + '</p>' +
            '<h1 class="pdp__title">' + UI.esc(product.name) + '</h1>' +
            '<p class="pdp__tagline">' + UI.esc(product.tagline) + '</p>' +

            '<div class="pdp__meta">' +
              '<span class="pdp__price">' + formatPrice(product.price) + '</span>' +
              '<span class="pdp__size">' + UI.esc(product.size) + '</span>' +
              '<span class="product-card__rating">' + UI.starsHTML(product.rating) +
                '<small>' + product.rating.toFixed(1) + ' · ' + product.reviews + ' reviews</small></span>' +
            '</div>' +

            activesHTML(product) +

            '<div class="pdp__buy">' +
              '<div class="qty" role="group" aria-label="Quantity">' +
                '<button type="button" class="qty__btn" id="pdpQtyDown" aria-label="Decrease quantity">−</button>' +
                '<span class="qty__value" id="pdpQty" aria-live="polite">1</span>' +
                '<button type="button" class="qty__btn" id="pdpQtyUp" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<button type="button" class="btn btn--primary" data-add-to-cart="' + UI.esc(product.id) +
                '" data-qty-source="#pdpQty">Add to bag — ' + formatPrice(product.price) + '</button>' +
            '</div>' +

            '<ul class="pdp__assurances">' +
              '<li>Free delivery on orders over \u20b91,999</li>' +
              '<li>Ships within 24 hours from Copenhagen</li>' +
              '<li>30-day returns, even on opened bottles</li>' +
              '<li>Refill and save 15% on every repeat order</li>' +
            '</ul>' +

            tabsHTML(product) +
          '</div>' +
        '</div>' +
      '</div>' +

      (related.length ? '' +
        '<section class="section section--mist">' +
          '<div class="container">' +
            '<div class="section-head">' +
              '<div class="section-head__text">' +
                '<p class="eyebrow">Pairs well with</p>' +
                '<h2 class="section-title">Build out the routine</h2>' +
              '</div>' +
              '<a class="arrow-link" href="shop.html">Shop all</a>' +
            '</div>' +
            '<div class="grid grid--3">' +
              related.map(function (p) { return window.renderCard(p); }).join('') +
            '</div>' +
          '</div>' +
        '</section>' : '');

    document.title = product.name + ' — Aurelia Lab';
    bindGallery(product);
    bindTabs();
    bindQty();
    UI.initReveal();
  }

  function bindGallery(product) {
    var stage = document.getElementById('pdpStage');
    var thumbs = root.querySelectorAll('.pdp__thumb');
    Array.prototype.forEach.call(thumbs, function (thumb) {
      thumb.addEventListener('click', function () {
        Array.prototype.forEach.call(thumbs, function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        stage.innerHTML = UI.productArt(product, { variant: Number(thumb.getAttribute('data-variant')) });
      });
    });
  }

  function bindTabs() {
    var buttons = root.querySelectorAll('.tabs__btn');
    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener('click', function () {
        Array.prototype.forEach.call(buttons, function (b) {
          var selected = b === button;
          b.classList.toggle('is-active', selected);
          b.setAttribute('aria-selected', String(selected));
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !selected;
        });
      });
    });
  }

  function bindQty() {
    var value = document.getElementById('pdpQty');
    document.getElementById('pdpQtyUp').addEventListener('click', function () {
      value.textContent = String(Math.min(99, Number(value.textContent) + 1));
    });
    document.getElementById('pdpQtyDown').addEventListener('click', function () {
      value.textContent = String(Math.max(1, Number(value.textContent) - 1));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var product = getProduct(param('id'));
    if (!product) {
      root.hidden = true;
      notFound.hidden = false;
      document.title = 'Product not found — Aurelia Lab';
      return;
    }
    render(product);
  });
})();
