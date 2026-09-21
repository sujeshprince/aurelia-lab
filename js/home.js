/* ==========================================================================
   AURELIA LAB — home.js
   Renders the homepage hero art, bestseller grid and concern tiles.
   ========================================================================== */

(function () {
  'use strict';

  /* Shared card markup — also used by shop.js and quiz.js via window.renderCard */
  function cardHTML(product, options) {
    options = options || {};
    var badgeClass = product.badge === 'New' ? ' product-card__badge--new' : '';
    var badge = product.badge
      ? '<span class="product-card__badge' + badgeClass + '">' + UI.esc(product.badge) + '</span>'
      : '';

    return '' +
      '<article class="product-card' + (options.extraClass ? ' ' + options.extraClass : '') + '"' +
        (options.score ? ' data-score="' + options.score + '"' : '') + '>' +
        '<div class="product-card__media">' +
          badge +
          (options.overlay || '') +
          UI.productArt(product) +
          '<div class="product-card__quick">' +
            '<button type="button" class="btn btn--primary btn--sm btn--block" data-add-to-cart="' +
              UI.esc(product.id) + '">Add to bag</button>' +
          '</div>' +
        '</div>' +
        '<div class="product-card__body">' +
          '<p class="product-card__cat">' + UI.esc(product.category) + '</p>' +
          '<h3 class="product-card__name"><a href="product.html?id=' + encodeURIComponent(product.id) + '">' +
            UI.esc(product.name) + '</a></h3>' +
          '<p class="product-card__tagline">' + UI.esc(product.tagline) + '</p>' +
          '<div class="product-card__foot">' +
            '<span class="product-card__price">' + formatPrice(product.price) + '</span>' +
            '<span class="product-card__rating">' + UI.starsHTML(product.rating) +
              '<small>' + product.reviews + '</small></span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  window.renderCard = cardHTML;

  document.addEventListener('DOMContentLoaded', function () {
    /* ---- Hero artwork ---- */
    var hero = document.getElementById('heroArt');
    if (hero) {
      var heroProduct = getProduct('niacinamide-5-serum');
      if (heroProduct) hero.innerHTML = UI.productArt(heroProduct, { variant: 1 });
    }

    /* ---- Bestseller grid ---- */
    var grid = document.getElementById('featuredGrid');
    if (grid) {
      var featured = PRODUCTS.filter(function (p) { return p.featured; }).slice(0, 6);
      grid.innerHTML = featured.map(function (p) { return cardHTML(p); }).join('');
    }

    /* ---- Concern tiles ---- */
    var concerns = document.getElementById('concernGrid');
    if (concerns) {
      concerns.innerHTML = CONCERNS.map(function (concern) {
        var info = CONCERN_INFO[concern] || { index: '—', blurb: '' };
        var total = productsByConcern(concern).length;
        return '' +
          '<a class="concern-tile" href="shop.html?concern=' + encodeURIComponent(concern) + '">' +
            '<span class="concern-tile__index">' + info.index + '</span>' +
            '<h3>' + UI.esc(concern) + '</h3>' +
            '<p>' + UI.esc(info.blurb) + '</p>' +
            '<span class="concern-tile__count">' + total + ' product' + (total === 1 ? '' : 's') + '</span>' +
          '</a>';
      }).join('');
    }

    UI.initReveal();
  });
})();
