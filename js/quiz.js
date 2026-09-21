/* ==========================================================================
   AURELIA LAB — quiz.js
   A six-question consultation that scores the catalogue and builds a routine.
   Depends on: data.js, ui.js, cart.js, home.js (window.renderCard)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Question set                                                      */
  /*  Each option contributes to concerns, categories and skin tags.    */
  /* ------------------------------------------------------------------ */

  var QUESTIONS = [
    {
      id: 'behaviour',
      question: 'An hour after cleansing, how does your skin feel?',
      hint: 'Think about your baseline, not a day when you used a new product.',
      options: [
        {
          label: 'Shiny all over, even in winter',
          concerns: { Oiliness: 3, Acne: 2 },
          categories: { Cleanser: 1, Treatment: 1 },
          tags: { oily: 3 }
        },
        {
          label: 'Shiny down the centre, normal on the cheeks',
          concerns: { Oiliness: 2, Texture: 1 },
          categories: { Serum: 1 },
          tags: { combination: 3 }
        },
        {
          label: 'Comfortable and balanced',
          concerns: { Hydration: 1 },
          categories: { Moisturizer: 1 },
          tags: { normal: 3 }
        },
        {
          label: 'Tight, rough or flaky',
          concerns: { Hydration: 3, Sensitivity: 1 },
          categories: { Moisturizer: 2, Cleanser: 1 },
          tags: { dry: 3 }
        },
        {
          label: 'Warm, red or stinging',
          concerns: { Sensitivity: 3, Hydration: 1 },
          categories: { Moisturizer: 2 },
          tags: { sensitive: 3 }
        }
      ]
    },
    {
      id: 'concern',
      question: 'What would you most like to change?',
      hint: 'Pick the one that bothers you on most days.',
      options: [
        {
          label: 'Breakouts and clogged pores',
          concerns: { Acne: 3, Oiliness: 2, Texture: 1 },
          categories: { Treatment: 2, Cleanser: 1 },
          tags: {}
        },
        {
          label: 'Dryness and dehydration',
          concerns: { Hydration: 3, Sensitivity: 1 },
          categories: { Serum: 1, Moisturizer: 2 },
          tags: {}
        },
        {
          label: 'Fine lines and loss of firmness',
          concerns: { 'Anti-Aging': 3, Texture: 1, Hydration: 1 },
          categories: { Serum: 2, Treatment: 1 },
          tags: {}
        },
        {
          label: 'Dark marks and uneven tone',
          concerns: { Brightening: 3, Texture: 1 },
          categories: { Serum: 2, SPF: 1 },
          tags: {}
        },
        {
          label: 'Redness and reactivity',
          concerns: { Sensitivity: 3, Hydration: 2 },
          categories: { Moisturizer: 2, Cleanser: 1 },
          tags: { sensitive: 2 }
        }
      ]
    },
    {
      id: 'reactivity',
      question: 'How does your skin react to strong actives?',
      hint: 'Retinol, acids, high-strength vitamin C.',
      options: [
        {
          label: 'No reaction at all — I can use anything',
          concerns: {},
          categories: { Treatment: 1 },
          tags: { resilient: 3 }
        },
        {
          label: 'A little dryness or tingling, then it settles',
          concerns: { Hydration: 1 },
          categories: { Moisturizer: 1 },
          tags: { resilient: 1, sensitive: 1 }
        },
        {
          label: 'It usually ends in irritation or peeling',
          concerns: { Sensitivity: 3 },
          categories: { Moisturizer: 2 },
          tags: { sensitive: 3 }
        }
      ]
    },
    {
      id: 'texture',
      question: 'What texture do you actually enjoy wearing?',
      hint: 'Be honest — a routine you dislike is a routine you will skip.',
      options: [
        {
          label: 'Weightless gel that disappears',
          concerns: { Oiliness: 1 },
          categories: {},
          tags: { textureLight: 3 }
        },
        {
          label: 'A light lotion',
          concerns: {},
          categories: {},
          tags: { textureMedium: 3 }
        },
        {
          label: 'A rich, cushiony cream',
          concerns: { Hydration: 1 },
          categories: {},
          tags: { textureRich: 3 }
        }
      ]
    },
    {
      id: 'spf',
      question: 'How often do you wear sunscreen?',
      hint: 'It is the single highest-impact step in any routine.',
      options: [
        {
          label: 'Every morning, all year',
          concerns: { 'Anti-Aging': 1 },
          categories: { SPF: 1 },
          tags: { spfDaily: 3 }
        },
        {
          label: 'In summer, or when I remember',
          concerns: { 'Anti-Aging': 2, Brightening: 1 },
          categories: { SPF: 2 },
          tags: { spfSometimes: 3 }
        },
        {
          label: 'Almost never',
          concerns: { 'Anti-Aging': 3, Brightening: 2 },
          categories: { SPF: 3 },
          tags: { spfRarely: 3 }
        }
      ]
    },
    {
      id: 'age',
      question: 'Which age band are you in?',
      hint: 'This only shifts how aggressively we prioritise actives.',
      options: [
        { label: 'Under 25', concerns: { Acne: 1, Oiliness: 1 }, categories: {}, tags: { ageYoung: 3 } },
        { label: '25 to 34', concerns: { Texture: 1, Brightening: 1 }, categories: {}, tags: { ageMid: 3 } },
        { label: '35 to 44', concerns: { 'Anti-Aging': 2, Hydration: 1 }, categories: {}, tags: { ageMature: 3 } },
        { label: '45 and over', concerns: { 'Anti-Aging': 3, Hydration: 2 }, categories: {}, tags: { ageSenior: 3 } }
      ]
    }
  ];

  /* Actives that reactive skin should be eased into. */
  var STRONG_ACTIVES = [
    'retinol', 'salicylic', 'ascorbic', 'azelaic', 'bha', 'papain', 'bromelain'
  ];

  var SKIN_TYPES = {
    oily: 'Oily',
    combination: 'Combination',
    normal: 'Balanced',
    dry: 'Dry',
    sensitive: 'Reactive'
  };

  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */

  var answers = {};
  var step = 0;

  var el = {};

  /* ------------------------------------------------------------------ */
  /*  Rendering                                                         */
  /* ------------------------------------------------------------------ */

  function renderSteps() {
    el.steps.innerHTML = QUESTIONS.map(function (question, index) {
      return '' +
        '<section class="quiz-step" data-step="' + index + '"' + (index === 0 ? '' : ' hidden') +
          ' aria-labelledby="q' + index + '">' +
          '<h2 class="quiz-step__q" id="q' + index + '">' + UI.esc(question.question) + '</h2>' +
          '<p class="quiz-step__hint">' + UI.esc(question.hint) + '</p>' +
          '<div class="quiz-options" role="radiogroup" aria-labelledby="q' + index + '">' +
            question.options.map(function (option, optionIndex) {
              return '' +
                '<button type="button" class="quiz-option" role="radio" aria-checked="false" ' +
                  'data-option="' + optionIndex + '">' +
                  '<span class="quiz-option__mark" aria-hidden="true"></span>' +
                  '<span>' + UI.esc(option.label) + '</span>' +
                '</button>';
            }).join('') +
          '</div>' +
        '</section>';
    }).join('');
  }

  function syncStep() {
    var sections = el.steps.querySelectorAll('[data-step]');
    Array.prototype.forEach.call(sections, function (section) {
      section.hidden = Number(section.getAttribute('data-step')) !== step;
    });

    var total = QUESTIONS.length;
    var percent = Math.round(((step + 1) / total) * 100);
    el.stepLabel.textContent = 'Question ' + (step + 1) + ' of ' + total;
    el.percent.textContent = percent + '%';
    el.fill.style.width = percent + '%';

    el.back.disabled = step === 0;
    el.next.disabled = !answers[QUESTIONS[step].id];
    el.next.textContent = step === total - 1 ? 'See my routine' : 'Next question';
  }

  function selectOption(questionIndex, optionIndex) {
    var question = QUESTIONS[questionIndex];
    answers[question.id] = optionIndex;

    var section = el.steps.querySelector('[data-step="' + questionIndex + '"]');
    var options = section.querySelectorAll('.quiz-option');
    Array.prototype.forEach.call(options, function (option, index) {
      var selected = index === optionIndex;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-checked', String(selected));
    });

    el.next.disabled = false;
  }

  /* ------------------------------------------------------------------ */
  /*  Scoring                                                           */
  /* ------------------------------------------------------------------ */

  function tally() {
    var concerns = {};
    var categories = {};
    var tags = {};

    QUESTIONS.forEach(function (question) {
      var index = answers[question.id];
      if (index === undefined) return;
      var option = question.options[index];

      Object.keys(option.concerns || {}).forEach(function (key) {
        concerns[key] = (concerns[key] || 0) + option.concerns[key];
      });
      Object.keys(option.categories || {}).forEach(function (key) {
        categories[key] = (categories[key] || 0) + option.categories[key];
      });
      Object.keys(option.tags || {}).forEach(function (key) {
        tags[key] = (tags[key] || 0) + option.tags[key];
      });
    });

    return { concerns: concerns, categories: categories, tags: tags };
  }

  function skinType(tags) {
    var ranked = ['oily', 'combination', 'normal', 'dry', 'sensitive']
      .map(function (key) { return { key: key, score: tags[key] || 0 }; })
      .sort(function (a, b) { return b.score - a.score; });
    return SKIN_TYPES[ranked[0].key] || 'Balanced';
  }

  function topConcerns(concerns) {
    return Object.keys(concerns)
      .sort(function (a, b) { return concerns[b] - concerns[a]; })
      .filter(function (key) { return concerns[key] > 0; })
      .slice(0, 3);
  }

  function scoreProduct(product, profile) {
    var score = 0;

    product.concerns.forEach(function (concern) {
      score += (profile.concerns[concern] || 0) * 2;
    });

    score += (profile.categories[product.category] || 0) * 1.5;

    /* Texture preference */
    var rich = product.shape === 'jar' ||
      (product.category === 'Treatment' && product.name.indexOf('Oil') !== -1);
    if (profile.tags.textureRich && rich) score += 2.5;
    if (profile.tags.textureLight && !rich && product.category !== 'Cleanser') score += 1.5;

    /* Sunscreen habits — push SPF hard for people who skip it */
    if (profile.tags.spfRarely && product.category === 'SPF') score += 3;
    if (profile.tags.spfDaily && product.category === 'SPF') score += 1;

    /* Reactive skin guard */
    var sensitivity = (profile.tags.sensitive || 0);
    if (sensitivity >= 3) {
      var harsh = product.actives.some(function (active) {
        var name = active.name.toLowerCase();
        return STRONG_ACTIVES.some(function (term) { return name.indexOf(term) !== -1; });
      });
      if (harsh) score -= 3;
      if (product.concerns.indexOf('Sensitivity') !== -1) score += 2;
    }

    /* Resilient skin can handle the strong stuff */
    if ((profile.tags.resilient || 0) >= 3) {
      var potent = product.actives.some(function (active) {
        var name = active.name.toLowerCase();
        return STRONG_ACTIVES.some(function (term) { return name.indexOf(term) !== -1; });
      });
      if (potent) score += 1.5;
    }

    /* Young skin: no need to lead with retinol */
    if (profile.tags.ageYoung && product.name.indexOf('Retinol') !== -1) score -= 2;

    score += product.rating * 0.4;

    return score;
  }

  function buildRoutine(ranked) {
    var routine = [];
    var wanted = ['Cleanser', 'Serum', 'Moisturizer', 'SPF'];

    wanted.forEach(function (category) {
      var match = ranked.filter(function (entry) {
        return entry.product.category === category;
      })[0];
      if (match) routine.push(match.product);
    });

    return routine;
  }

  /* ------------------------------------------------------------------ */
  /*  Result screen                                                     */
  /* ------------------------------------------------------------------ */

  function showResult() {
    var profile = tally();
    var type = skinType(profile.tags);
    var concerns = topConcerns(profile.concerns);

    var ranked = PRODUCTS.map(function (product) {
      return { product: product, score: scoreProduct(product, profile) };
    }).sort(function (a, b) { return b.score - a.score; });

    var top = ranked.slice(0, 4);
    var maxScore = top[0] ? top[0].score : 1;
    var routine = buildRoutine(ranked);

    el.progress.hidden = true;
    el.steps.hidden = true;
    el.nav.hidden = true;
    el.result.hidden = false;

    el.result.innerHTML = '' +
      '<div class="quiz-result">' +
        '<div class="quiz-result__head">' +
          '<p class="eyebrow">Your consultation result</p>' +
          '<h1 class="section-title">' + UI.esc(type) + ' skin' +
            (concerns.length ? ', focused on ' + UI.esc(concerns[0].toLowerCase()) : '') + '</h1>' +
          '<p class="lede">Based on your answers we would lead with the four formulas below. ' +
            'Introduce one new product at a time, four to five days apart.</p>' +
          '<div class="quiz-result__profile">' +
            '<span class="chip">Skin type: ' + UI.esc(type) + '</span>' +
            concerns.map(function (concern) {
              return '<span class="chip">' + UI.esc(concern) + '</span>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<h2 class="section-title" style="font-size:1.6rem; margin-bottom:22px;">Your best matches</h2>' +
        '<div class="grid grid--2">' +
          top.map(function (entry) {
            var match = Math.max(55, Math.min(98, Math.round((entry.score / maxScore) * 94)));
            return window.renderCard(entry.product, {
              extraClass: 'quiz-match',
              overlay: '<span class="quiz-match__score">' + match + '% match</span>'
            });
          }).join('') +
        '</div>' +

        '<div class="quiz-routine">' +
          '<div>' +
            '<strong>Your four-step routine</strong>' +
            '<span>' + routine.map(function (p) { return UI.esc(p.name); }).join(' · ') + '</span>' +
          '</div>' +
          '<button type="button" class="btn btn--primary" id="addRoutine">' +
            'Add routine to bag — ' + formatPrice(routine.reduce(function (sum, p) { return sum + p.price; }, 0)) +
          '</button>' +
        '</div>' +

        '<div class="quiz-nav">' +
          '<button type="button" class="btn btn--ghost" id="quizRestart">Retake the quiz</button>' +
          '<a class="btn btn--ghost" href="shop.html">Browse everything</a>' +
        '</div>' +
      '</div>';

    var addButton = document.getElementById('addRoutine');
    addButton.addEventListener('click', function () {
      routine.forEach(function (product) { Cart.add(product.id, 1, { silent: true }); });
      UI.toast('Your four-step routine is in the bag.', 'success', {
        label: 'View bag',
        onClick: Cart.open
      });
    });

    document.getElementById('quizRestart').addEventListener('click', restart);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    UI.initReveal();
  }

  /* ------------------------------------------------------------------ */
  /*  Navigation                                                        */
  /* ------------------------------------------------------------------ */

  function restart() {
    answers = {};
    step = 0;

    el.intro.hidden = false;
    el.body.hidden = true;
    el.result.hidden = true;
    el.result.innerHTML = '';
    el.progress.hidden = false;
    el.steps.hidden = false;
    el.nav.hidden = false;

    renderSteps();
    bindOptions();
    syncStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindOptions() {
    var sections = el.steps.querySelectorAll('[data-step]');
    Array.prototype.forEach.call(sections, function (section) {
      var questionIndex = Number(section.getAttribute('data-step'));
      var options = section.querySelectorAll('.quiz-option');
      Array.prototype.forEach.call(options, function (option, optionIndex) {
        option.addEventListener('click', function () {
          selectOption(questionIndex, optionIndex);
        });
        option.addEventListener('dblclick', function () {
          selectOption(questionIndex, optionIndex);
          next();
        });
      });
    });
  }

  function next() {
    if (step === QUESTIONS.length - 1) return showResult();
    step += 1;
    syncStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function back() {
    if (step === 0) return;
    step -= 1;
    syncStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /*  Boot                                                              */
  /* ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', function () {
    el.intro = document.getElementById('quizIntro');
    el.body = document.getElementById('quizBody');
    el.progress = document.getElementById('quizProgress');
    el.steps = document.getElementById('quizSteps');
    el.nav = document.getElementById('quizNav');
    el.result = document.getElementById('quizResult');
    el.stepLabel = document.getElementById('quizStepLabel');
    el.percent = document.getElementById('quizPercent');
    el.fill = document.getElementById('quizFill');
    el.back = document.getElementById('quizBack');
    el.next = document.getElementById('quizNext');

    renderSteps();
    bindOptions();
    syncStep();

    document.getElementById('quizStart').addEventListener('click', function () {
      el.intro.hidden = true;
      el.body.hidden = false;
      syncStep();
    });

    el.next.addEventListener('click', next);
    el.back.addEventListener('click', back);

    document.addEventListener('keydown', function (event) {
      if (el.body.hidden || !el.result.hidden) return;
      if (event.key === 'ArrowRight' && !el.next.disabled) next();
      if (event.key === 'ArrowLeft' && !el.back.disabled) back();
    });
  });
})();
