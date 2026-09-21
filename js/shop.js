/* ==========================================================================
   AURELIA LAB — shop.js
   In-memory filtering, search, sorting and pagination for the catalogue.
   Depends on: data.js, ui.js, cart.js, home.js (window.renderCard)
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SIZE = 9;
  var bounds = priceBounds();

  var state = {
    query: '',
    categories: [],
    concerns: [],
    maxPrice: bounds.max,
    sort: 'featured',
    shown: PAGE_SIZE
  };

  var el = {};

  /* ------------------------------------------------------------------ */
  /*  URL state                                                         */
  /* ------------------------------------------------------------------ */

  function readURL() {
    var params = new URLSearchParams(window.location.search);
    var category = params.get('category');
    var concern = params.get('concern');
    var query = params.get('q');

    if (category && CATEGORIES.indexOf(category) !== -1) state.categories = [category];
    if (concern && CONCERNS.indexOf(concern) !== -1) state.concerns = [concern];
    if (query) state.query = query;
  }

  function writeURL() {
    var params = new URLSearchParams();
    if (state.categories.length === 1) params.set('category', state.categories[0]);
    if (state.concerns.length === 1) params.set('concern', state.concerns[0]);
    if (state.query) params.set('q', state.query);

    var next = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', next);
  }

  /* ------------------------------------------------------------------ */
  /*  Filtering                                                         */
  /* ------------------------------------------------------------------ */

  function matchesQuery(product, query) {
    if (!query) return true;
    var haystack = [
      product.name,
      product.category,
      product.tagline,
      product.concerns.join(' ')
    ].concat(product.actives.map(function (a) { return a.name; })).join(' ').toLowerCase();
    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function filtered() {
    return PRODUCTS.filter(function (product) {
      if (product.price > state.maxPrice) return false;
      if (!matchesQuery(product, state.query)) return false;
      if (state.categories.length && state.categories.indexOf(product.category) === -1) return false;
      if (state.concerns.length && !state.concerns.some(function (c) {
        return product.concerns.indexOf(c) !== -1;
      })) return false;
      return true;
    });
  }

  function sorted(list) {
    var copy = list.slice();
    switch (state.sort) {
      case 'price-asc':
        return copy.sort(function (a, b) { return a.price - b.price; });
      case 'price-desc':
        return copy.sort(function (a, b) { return b.price - a.price; });
      case 'rating':
        return copy.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
      case 'name':
        return copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      default:
        return copy.sort(function (a, b) {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
        });
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Filter sidebar markup                                             */
  /* ------------------------------------------------------------------ */

  function countBy(key, value) {
    return PRODUCTS.filter(function (p) { return p[key] === value; }).length;
  }

  function countConcern(concern) {
    return productsByConcern(concern).length;
  }

  function renderFilters() {
    el.categoryFilters.innerHTML = CATEGORIES.map(function (category) {
      var checked = state.categories.indexOf(category) !== -1;
      return checkHTML('category', category, checked, countBy('category', category));
    }).join('');

    el.concernFilters.innerHTML = CONCERNS.map(function (concern) {
      var checked = state.concerns.indexOf(concern) !== -1;
      return checkHTML('concern', concern, checked, countConcern(concern));
    }).join('');
  }

  function checkHTML(group, value, checked, count) {
    var id = 'f-' + group + '-' + value.replace(/[^a-z0-9]/gi, '');
    return '' +
      '<label class="check" for="' + id + '">' +
        '<input type="checkbox" id="' + id + '" data-filter-group="' + group + '" value="' +
          UI.esc(value) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="check__label">' + UI.esc(value) + '</span>' +
        '<span class="check__count">' + count + '</span>' +
      '</label>';
  }

  /* ------------------------------------------------------------------ */
  /*  Active filter chips                                               */
  /* ------------------------------------------------------------------ */

  function renderChips() {
    var chips = [];

    state.categories.forEach(function (category) {
      chips.push(chipHTML('category', category));
    });
    state.concerns.forEach(function (concern) {
      chips.push(chipHTML('concern', concern));
    });
    if (state.maxPrice < bounds.max) {
      chips.push(chipHTML('price', 'Under ' + formatPrice(state.maxPrice)));
    }
    if (state.query) {
      chips.push(chipHTML('query', '\u201c' + state.query + '\u201d'));
    }

    if (chips.length > 1) {
      chips.push('<button type="button" class="chip chip--clear" data-filter-reset>Clear all</button>');
    }

    el.activeChips.innerHTML = chips.join('');
    el.activeChips.hidden = chips.length === 0;

    var activeCount = state.categories.length + state.concerns.length +
      (state.maxPrice < bounds.max ? 1 : 0) + (state.query ? 1 : 0);
    el.filterCount.textContent = activeCount ? '(' + activeCount + ')' : '';
  }

  function chipHTML(group, label) {
    return '' +
      '<span class="chip">' + UI.esc(label) +
        '<button type="button" data-chip-remove="' + group + '" value="' + UI.esc(label) +
        '" aria-label="Remove filter ' + UI.esc(label) + '">\u2715</button>' +
      '</span>';
  }

  /* ------------------------------------------------------------------ */
  /*  Grid                                                              */
  /* ------------------------------------------------------------------ */

  function renderGrid() {
    var list = sorted(filtered());
    var visible = list.slice(0, state.shown);

    el.resultCount.innerHTML = list.length
      ? '<strong>' + list.length + '</strong> formula' + (list.length === 1 ? '' : 's')
      : 'No formulas';

    el.grid.innerHTML = visible.map(function (product) {
      return window.renderCard(product);
    }).join('');

    el.emptyState.hidden = list.length !== 0;
    el.grid.hidden = list.length === 0;
    el.loadMore.hidden = list.length <= state.shown;

    UI.initReveal(el.grid);
  }

  function render() {
    renderFilters();
    renderChips();
    renderGrid();
    writeURL();
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                            */
  /* ------------------------------------------------------------------ */

  function toggleIn(list, value) {
    var index = list.indexOf(value);
    if (index === -1) list.push(value); else list.splice(index, 1);
  }

  function resetAll() {
    state.categories = [];
    state.concerns = [];
    state.maxPrice = bounds.max;
    state.query = '';
    state.sort = 'featured';
    state.shown = PAGE_SIZE;

    el.searchInput.value = '';
    el.priceRange.value = String(bounds.max);
    el.priceMaxLabel.textContent = formatPrice(bounds.max);
    el.sortSelect.value = 'featured';
    render();
    UI.toast('Filters cleared.', 'info');
  }

  function bind() {
    /* Sidebar checkboxes (delegated — list is re-rendered on each pass) */
    el.filters.addEventListener('change', function (event) {
      var input = event.target.closest('[data-filter-group]');
      if (!input) return;
      var group = input.getAttribute('data-filter-group');
      toggleIn(group === 'category' ? state.categories : state.concerns, input.value);
      state.shown = PAGE_SIZE;
      render();
    });

    /* Chips */
    el.activeChips.addEventListener('click', function (event) {
      var button = event.target.closest('[data-chip-remove]');
      if (!button) return;
      var group = button.getAttribute('data-chip-remove');
      if (group === 'category') toggleIn(state.categories, button.value);
      if (group === 'concern') toggleIn(state.concerns, button.value);
      if (group === 'price') state.maxPrice = bounds.max;
      if (group === 'query') { state.query = ''; el.searchInput.value = ''; }
      state.shown = PAGE_SIZE;
      render();
    });

    /* Search (debounced) */
    var timer = null;
    el.searchInput.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.query = el.searchInput.value.trim();
        state.shown = PAGE_SIZE;
        render();
      }, 180);
    });

    /* Price */
    el.priceRange.addEventListener('input', function () {
      state.maxPrice = Number(el.priceRange.value);
      el.priceMaxLabel.textContent = formatPrice(state.maxPrice);
      state.shown = PAGE_SIZE;
      renderGrid();
      renderChips();
      writeURL();
    });

    /* Sort */
    el.sortSelect.addEventListener('change', function () {
      state.sort = el.sortSelect.value;
      state.shown = PAGE_SIZE;
      renderGrid();
    });

    /* Load more */
    el.loadMore.addEventListener('click', function () {
      state.shown += PAGE_SIZE;
      renderGrid();
    });

    /* Reset (sidebar + empty state) */
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-filter-reset]')) resetAll();
    });

    /* Collapsible filter groups */
    document.addEventListener('click', function (event) {
      var head = event.target.closest('[data-group-toggle]');
      if (!head) return;
      var group = head.closest('[data-group]');
      var collapsed = group.classList.toggle('is-collapsed');
      head.setAttribute('aria-expanded', String(!collapsed));
    });

    /* Mobile filter drawer */
    function openFilters() {
      el.filters.classList.add('is-open');
      el.filterOverlay.hidden = false;
      requestAnimationFrame(function () { el.filterOverlay.classList.add('is-open'); });
      document.body.classList.add('drawer-open');
    }
    function closeFilters() {
      el.filters.classList.remove('is-open');
      el.filterOverlay.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      setTimeout(function () { el.filterOverlay.hidden = true; }, 340);
    }

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-filter-open]')) openFilters();
    });
    el.filterOverlay.addEventListener('click', closeFilters);
    document.querySelector('[data-filter-close]').addEventListener('click', closeFilters);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeFilters();
    });

    /* Keep in sync when the user navigates back/forward */
    window.addEventListener('popstate', function () {
      state.categories = [];
      state.concerns = [];
      state.query = '';
      readURL();
      el.searchInput.value = state.query;
      render();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                              */
  /* ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', function () {
    el.filters = document.getElementById('filters');
    el.categoryFilters = document.getElementById('categoryFilters');
    el.concernFilters = document.getElementById('concernFilters');
    el.priceRange = document.getElementById('priceRange');
    el.priceMaxLabel = document.getElementById('priceMaxLabel');
    el.searchInput = document.getElementById('searchInput');
    el.sortSelect = document.getElementById('sortSelect');
    el.activeChips = document.getElementById('activeChips');
    el.resultCount = document.getElementById('resultCount');
    el.grid = document.getElementById('productGrid');
    el.emptyState = document.getElementById('emptyState');
    el.loadMore = document.getElementById('loadMore');
    el.filterCount = document.getElementById('filterCount');
    el.filterOverlay = document.querySelector('[data-filter-overlay]');

    el.priceRange.min = String(bounds.min);
    el.priceRange.max = String(bounds.max);
    el.priceRange.value = String(bounds.max);
    document.getElementById('priceMinLabel').textContent = formatPrice(bounds.min);
    el.priceMaxLabel.textContent = formatPrice(bounds.max);

    readURL();
    el.searchInput.value = state.query;
    render();
    bind();
  });
})();
