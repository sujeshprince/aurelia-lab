/* ==========================================================================
   AURELIA LAB — data.js
   Product catalog + shared data helpers. Plain script (no modules) so the
   site also works when opened directly from the filesystem.
   ========================================================================== */

var BRAND = 'AURELIA LAB';

var CATEGORIES = ['Cleanser', 'Serum', 'Moisturizer', 'SPF', 'Treatment'];

var CONCERNS = [
  'Acne',
  'Hydration',
  'Anti-Aging',
  'Brightening',
  'Sensitivity',
  'Texture',
  'Oiliness'
];

var CONCERN_INFO = {
  'Acne':        { index: '01', blurb: 'Decongest pores and calm active breakouts without stripping the barrier.' },
  'Hydration':   { index: '02', blurb: 'Rebuild water reserves with humectants and barrier-identical lipids.' },
  'Anti-Aging':  { index: '03', blurb: 'Support collagen, soften fine lines and defend against daily oxidative stress.' },
  'Brightening': { index: '04', blurb: 'Even tone and fade post-blemish marks with targeted pigment actives.' },
  'Sensitivity': { index: '05', blurb: 'Fragrance-free, low-irritation formulas built for reactive and compromised skin.' },
  'Texture':     { index: '06', blurb: 'Refine rough patches and enlarged pores with gentle chemical resurfacing.' },
  'Oiliness':    { index: '07', blurb: 'Regulate sebum production and mattify shine without over-drying.' }
};

/* hue  -> drives the generated SVG packaging colour
   shape -> 'dropper' | 'pump' | 'tube' | 'jar' | 'bottle'               */
var PRODUCTS = [
  {
    id: 'clarify-gel-cleanser',
    name: 'Clarify Gel Cleanser',
    category: 'Cleanser',
    concerns: ['Acne', 'Oiliness'],
    price: 849,
    size: '150 ml',
    rating: 4.7,
    reviews: 412,
    badge: 'Bestseller',
    featured: true,
    shape: 'tube',
    hue: 158,
    tagline: 'A low-foam salicylic gel that clears without the squeak.',
    description:
      'A transparent, low-foam gel that dissolves excess sebum and lifts debris from congested pores while a 2% salicylic acid core keeps the barrier intact. Rinses clean with zero tightness.',
    actives: [
      { name: 'Salicylic Acid', pct: '2%' },
      { name: 'Zinc PCA', pct: '0.5%' },
      { name: 'Panthenol', pct: '1%' }
    ],
    ingredients:
      'Aqua, Glycerin, Cocamidopropyl Betaine, Salicylic Acid 2%, Zinc PCA, Panthenol, Allantoin, Sodium Hydroxide, Sodium Benzoate, Potassium Sorbate.',
    steps: [
      'Dispense a 2 cm ribbon into damp palms and emulsify.',
      'Massage over the face for 30 seconds, avoiding the eye area.',
      'Rinse with lukewarm water and pat dry. Use morning and night.'
    ]
  },
  {
    id: 'gentle-cream-cleanser',
    name: 'Gentle Cream Cleanser',
    category: 'Cleanser',
    concerns: ['Sensitivity', 'Hydration'],
    price: 799,
    size: '150 ml',
    rating: 4.8,
    reviews: 286,
    badge: null,
    featured: false,
    shape: 'tube',
    hue: 30,
    tagline: 'A milky, fragrance-free cleanse for reactive skin.',
    description:
      'A non-foaming cream that melts makeup and sunscreen while ceramides and oat lipids replenish what cleansing takes away. Clinically tested on compromised and post-procedure skin.',
    actives: [
      { name: 'Ceramide NP', pct: '0.2%' },
      { name: 'Colloidal Oat', pct: '1%' },
      { name: 'Glycerin', pct: '12%' }
    ],
    ingredients:
      'Aqua, Glycerin, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Ceramide NP, Avena Sativa Kernel Extract, Bisabolol, Allantoin, Sodium Hyaluronate, Tocopherol.',
    steps: [
      'Warm two pumps between dry palms.',
      'Massage into dry skin for 45 seconds to dissolve makeup.',
      'Add water to emulsify, then rinse or remove with a soft cloth.'
    ]
  },
  {
    id: 'resurface-enzyme-cleanser',
    name: 'Resurface Enzyme Cleanser',
    category: 'Cleanser',
    concerns: ['Texture', 'Brightening'],
    price: 949,
    size: '100 g',
    rating: 4.6,
    reviews: 174,
    badge: 'New',
    featured: false,
    shape: 'tube',
    hue: 282,
    tagline: 'A water-activated powder-to-cream enzyme polish.',
    description:
      'Papain and bromelain enzymes digest dead surface cells while finely milled rice bran physically smooths. No micro-tears, no post-cleanse redness — just immediate light reflection.',
    actives: [
      { name: 'Papain Enzyme', pct: '1.2%' },
      { name: 'Bromelain', pct: '0.6%' },
      { name: 'Niacinamide', pct: '3%' }
    ],
    ingredients:
      'Sodium Cocoyl Isethionate, Oryza Sativa Powder, Papain, Bromelain, Niacinamide 3%, Kaolin, Sodium Hyaluronate, Maltodextrin, Citric Acid.',
    steps: [
      'Tip a half-teaspoon into wet hands and work into a cream.',
      'Massage over the face for 30 seconds with light pressure.',
      'Rinse thoroughly. Use two to three evenings per week.'
    ]
  },
  {
    id: 'niacinamide-5-serum',
    name: 'Niacinamide 5% Serum',
    category: 'Serum',
    concerns: ['Oiliness', 'Texture', 'Brightening'],
    price: 1099,
    size: '30 ml',
    rating: 4.8,
    reviews: 934,
    badge: 'Bestseller',
    featured: true,
    shape: 'dropper',
    hue: 45,
    tagline: 'Pore-refining and sebum-regulating, at a tolerable dose.',
    description:
      'A weightless water-gel delivering 5% niacinamide with zinc to visibly tighten pores and balance shine over four weeks. Formulated below the 10% irritation threshold for daily use.',
    actives: [
      { name: 'Niacinamide', pct: '5%' },
      { name: 'Zinc PCA', pct: '1%' },
      { name: 'Tamarind Gum', pct: '0.4%' }
    ],
    ingredients:
      'Aqua, Niacinamide 5%, Glycerin, Zinc PCA, Tamarindus Indica Seed Gum, Sodium Hyaluronate, Panthenol, Allantoin, Phenoxyethanol, Ethylhexylglycerin.',
    steps: [
      'Apply three to four drops to clean, slightly damp skin.',
      'Press in with palms; follow immediately with moisturiser.',
      'Use morning and evening. Introduce over one week if new to niacinamide.'
    ]
  },
  {
    id: 'hyaluronic-hydration-serum',
    name: 'Hyaluronic Hydration Serum',
    category: 'Serum',
    concerns: ['Hydration', 'Sensitivity'],
    price: 1199,
    size: '30 ml',
    rating: 4.9,
    reviews: 1206,
    badge: null,
    featured: true,
    shape: 'dropper',
    hue: 200,
    tagline: 'Three molecular weights, one deep reservoir of water.',
    description:
      'Low, medium and high molecular weight hyaluronic acid hydrate at three depths, sealed in by a glycerin-rich base. Skin measures 38% more hydrated at eight hours in instrumental testing.',
    actives: [
      { name: 'Sodium Hyaluronate', pct: '2%' },
      { name: 'Hydrolysed HA', pct: '0.5%' },
      { name: 'Betaine', pct: '2%' }
    ],
    ingredients:
      'Aqua, Glycerin, Sodium Hyaluronate, Hydrolysed Hyaluronic Acid, Betaine, Trehalose, Panthenol, Sodium PCA, Allantoin, Citric Acid, Phenoxyethanol.',
    steps: [
      'Apply to damp skin immediately after cleansing.',
      'Smooth four drops across the face and neck, pressing to absorb.',
      'Layer moisturiser on top to lock the water in.'
    ]
  },
  {
    id: 'retinol-night-serum',
    name: 'Retinol 0.3% Night Serum',
    category: 'Serum',
    concerns: ['Anti-Aging', 'Texture'],
    price: 1899,
    size: '30 ml',
    rating: 4.7,
    reviews: 618,
    badge: 'Editor\u2019s pick',
    featured: true,
    shape: 'dropper',
    hue: 264,
    tagline: 'Encapsulated retinol, buffered for nightly tolerance.',
    description:
      'Time-released 0.3% retinol is delivered in a ceramide-buffered oil-free base, so collagen stimulation arrives without the peeling that usually comes with it. Visible smoothing from week six.',
    actives: [
      { name: 'Encapsulated Retinol', pct: '0.3%' },
      { name: 'Bakuchiol', pct: '1%' },
      { name: 'Ceramide NP', pct: '0.1%' }
    ],
    ingredients:
      'Caprylic/Capric Triglyceride, Squalane, Retinol 0.3%, Bakuchiol, Ceramide NP, Tocopherol, Bisabolol, Helianthus Annuus Seed Oil.',
    steps: [
      'Apply three drops to dry skin at night, after cleansing.',
      'Start twice weekly, building to every other night.',
      'Always follow with moisturiser and SPF the next morning.'
    ]
  },
  {
    id: 'vitamin-c-15-serum',
    name: 'Vitamin C 15% Serum',
    category: 'Serum',
    concerns: ['Brightening', 'Anti-Aging'],
    price: 1599,
    size: '30 ml',
    rating: 4.6,
    reviews: 522,
    badge: null,
    featured: false,
    shape: 'dropper',
    hue: 25,
    tagline: 'Stabilised L-ascorbic acid that stays clear to the last drop.',
    description:
      '15% L-ascorbic acid paired with ferulic acid and vitamin E in an anhydrous-free, low-water system that resists oxidation. Fades dark marks and defends against pollution-driven pigmentation.',
    actives: [
      { name: 'L-Ascorbic Acid', pct: '15%' },
      { name: 'Ferulic Acid', pct: '0.5%' },
      { name: 'Vitamin E', pct: '1%' }
    ],
    ingredients:
      'Aqua, Ascorbic Acid 15%, Propanediol, Ferulic Acid, Tocopheryl Acetate, Sodium Hyaluronate, Panthenol, Sodium Metabisulfite, Phenoxyethanol.',
    steps: [
      'Apply four drops to clean skin each morning.',
      'Wait 60 seconds before layering niacinamide or SPF.',
      'Store away from direct light; discard if the fluid turns deep amber.'
    ]
  },
  {
    id: 'azelaic-10-serum',
    name: 'Azelaic Acid 10% Serum',
    category: 'Serum',
    concerns: ['Acne', 'Brightening', 'Sensitivity'],
    price: 1249,
    size: '30 ml',
    rating: 4.7,
    reviews: 389,
    badge: null,
    featured: false,
    shape: 'dropper',
    hue: 340,
    tagline: 'For redness, rosacea-prone skin and stubborn marks.',
    description:
      'A 10% azelaic acid suspension that targets inflammatory papules, generalised redness and post-acne pigmentation in a single step. Well tolerated on skin that cannot handle acids.',
    actives: [
      { name: 'Azelaic Acid', pct: '10%' },
      { name: 'Niacinamide', pct: '4%' },
      { name: 'Centella Asiatica', pct: '1%' }
    ],
    ingredients:
      'Aqua, Azelaic Acid 10%, Niacinamide, Dimethyl Isosorbide, Centella Asiatica Extract, Allantoin, Glycerin, Xanthan Gum, Phenoxyethanol.',
    steps: [
      'Apply a pea-sized amount to the full face or affected areas.',
      'Use once daily to begin, increasing to twice if comfortable.',
      'Expect a brief tingling sensation on first applications.'
    ]
  },
  {
    id: 'ceramide-barrier-moisturizer',
    name: 'Ceramide Barrier Moisturizer',
    category: 'Moisturizer',
    concerns: ['Hydration', 'Sensitivity', 'Anti-Aging'],
    price: 1349,
    size: '50 ml',
    rating: 4.9,
    reviews: 1478,
    badge: 'Bestseller',
    featured: true,
    shape: 'jar',
    hue: 165,
    tagline: 'A three-ceramide cream that rebuilds the lipid bilayer.',
    description:
      'Ceramides NP, AP and EOP in the skin\u2019s native 3:1:1 ratio, suspended with cholesterol and fatty acids. Barrier recovery measured at 72 hours; suitable for eczema-prone and post-procedure skin.',
    actives: [
      { name: 'Ceramide Complex', pct: '1%' },
      { name: 'Squalane', pct: '5%' },
      { name: 'Sodium Hyaluronate', pct: '0.5%' }
    ],
    ingredients:
      'Aqua, Glycerin, Squalane, Cetearyl Alcohol, Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Panthenol, Sodium Hyaluronate, Allantoin, Tocopherol.',
    steps: [
      'Warm a pea-sized amount between fingertips.',
      'Press into the face and neck as the final step of your routine.',
      'Use morning and night, or layer more thickly as an overnight mask.'
    ]
  },
  {
    id: 'oil-free-water-gel',
    name: 'Oil-Free Water Gel',
    category: 'Moisturizer',
    concerns: ['Acne', 'Oiliness'],
    price: 999,
    size: '50 ml',
    rating: 4.5,
    reviews: 341,
    badge: null,
    featured: false,
    shape: 'jar',
    hue: 190,
    tagline: 'Weightless hydration that never feeds a breakout.',
    description:
      'A bouncy, non-comedogenic gel that hydrates with glycerin and trehalose while silica powder blurs shine on contact. Leaves no residue under sunscreen or makeup.',
    actives: [
      { name: 'Trehalose', pct: '3%' },
      { name: 'Niacinamide', pct: '2%' },
      { name: 'Silica', pct: '1%' }
    ],
    ingredients:
      'Aqua, Glycerin, Trehalose, Niacinamide, Dimethicone Crosspolymer, Silica, Sodium Hyaluronate, Allantoin, Carbomer, Sodium Hydroxide, Phenoxyethanol.',
    steps: [
      'Smooth a pea-sized amount over damp skin.',
      'Allow 30 seconds to set before applying SPF.',
      'Reapply lightly at midday if skin feels tight.'
    ]
  },
  {
    id: 'rich-repair-night-cream',
    name: 'Rich Repair Night Cream',
    category: 'Moisturizer',
    concerns: ['Anti-Aging', 'Hydration'],
    price: 1749,
    size: '50 ml',
    rating: 4.7,
    reviews: 405,
    badge: null,
    featured: false,
    shape: 'jar',
    hue: 300,
    tagline: 'Peptides and shea for overnight structural repair.',
    description:
      'A dense but non-greasy balm-cream with a five-peptide blend that supports firmness while shea butter and murumuru seal in moisture through the night. Wakes skin plump and even.',
    actives: [
      { name: 'Peptide Blend', pct: '3%' },
      { name: 'Shea Butter', pct: '8%' },
      { name: 'Coenzyme Q10', pct: '0.5%' }
    ],
    ingredients:
      'Aqua, Butyrospermum Parkii Butter, Glycerin, Astrocaryum Murumuru Seed Butter, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Ubiquinone, Squalane, Tocopherol.',
    steps: [
      'Apply as the last step of your evening routine.',
      'Massage upward and outward across the face and neck.',
      'Use nightly; reduce to alternate nights if skin feels over-rich.'
    ]
  },
  {
    id: 'mineral-spf-50-fluid',
    name: 'Mineral SPF 50 Fluid',
    category: 'SPF',
    concerns: ['Anti-Aging', 'Sensitivity'],
    price: 1099,
    size: '50 ml',
    rating: 4.6,
    reviews: 712,
    badge: null,
    featured: true,
    shape: 'bottle',
    hue: 35,
    tagline: 'Non-nano zinc, zero white cast, invisible under makeup.',
    description:
      'A sheer, non-nano zinc oxide fluid that spreads like a serum and dries to a soft-matte finish. Broad spectrum SPF 50 / PA++++ with no chemical filters, fragrance or essential oils.',
    actives: [
      { name: 'Zinc Oxide', pct: '18%' },
      { name: 'Niacinamide', pct: '2%' },
      { name: 'Vitamin E', pct: '0.5%' }
    ],
    ingredients:
      'Aqua, Zinc Oxide 18%, Caprylic/Capric Triglyceride, Glycerin, Niacinamide, Silica, Tocopheryl Acetate, Sodium Hyaluronate, Xanthan Gum, Phenoxyethanol.',
    steps: [
      'Apply two finger-lengths as the final step each morning.',
      'Blend outward; allow 60 seconds to set before makeup.',
      'Reapply every two hours during direct sun exposure.'
    ]
  },
  {
    id: 'daily-spf-30-lotion',
    name: 'Daily SPF 30 Lotion',
    category: 'SPF',
    concerns: ['Hydration', 'Anti-Aging'],
    price: 899,
    size: '75 ml',
    rating: 4.5,
    reviews: 498,
    badge: null,
    featured: false,
    shape: 'pump',
    hue: 210,
    tagline: 'Moisturiser and broad spectrum defence in one pump.',
    description:
      'A lightweight hybrid that replaces your morning moisturiser with SPF 30 broad spectrum protection plus glycerin and ceramides. The pump delivers a consistent two-finger dose.',
    actives: [
      { name: 'Tinosorb S', pct: '3%' },
      { name: 'Ceramide NP', pct: '0.1%' },
      { name: 'Glycerin', pct: '8%' }
    ],
    ingredients:
      'Aqua, Glycerin, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Ethylhexyl Salicylate, Ceramide NP, Tocopherol, Panthenol, Allantoin, Carbomer, Phenoxyethanol.',
    steps: [
      'Pump twice onto fingertips each morning.',
      'Apply evenly to face, ears and neck as your final skincare step.',
      'Reapply after swimming, sweating or towelling.'
    ]
  },
  {
    id: 'peptide-eye-concentrate',
    name: 'Peptide Eye Concentrate',
    category: 'Treatment',
    concerns: ['Anti-Aging', 'Hydration'],
    price: 1449,
    size: '15 ml',
    rating: 4.6,
    reviews: 367,
    badge: null,
    featured: false,
    shape: 'dropper',
    hue: 250,
    tagline: 'Targets puffiness, dark circles and crow\u2019s feet.',
    description:
      'A cooling, caffeine-laced concentrate with matrixyl peptides to firm the orbital area and reduce the appearance of fluid retention. The precision applicator deposits exactly one dose.',
    actives: [
      { name: 'Caffeine', pct: '3%' },
      { name: 'Matrixyl 3000', pct: '2%' },
      { name: 'Hesperidin Methyl Chalcone', pct: '0.5%' }
    ],
    ingredients:
      'Aqua, Caffeine, Glycerin, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Hesperidin Methyl Chalcone, Sodium Hyaluronate, Panthenol, Dipeptide-2, Phenoxyethanol.',
    steps: [
      'Dispense one drop per eye onto the applicator tip.',
      'Tap gently along the orbital bone, from inner to outer corner.',
      'Use morning and evening before moisturiser.'
    ]
  },
  {
    id: 'bha-2-clarifying-solution',
    name: 'BHA 2% Clarifying Solution',
    category: 'Treatment',
    concerns: ['Acne', 'Texture', 'Oiliness'],
    price: 749,
    size: '100 ml',
    rating: 4.8,
    reviews: 1093,
    badge: 'Bestseller',
    featured: true,
    shape: 'bottle',
    hue: 150,
    tagline: 'An overnight liquid exfoliant for congested pores.',
    description:
      'A leave-on 2% salicylic acid solution buffered with green tea and a low-dose betaine complex, so pores are decongested overnight without the flaking of a full-strength peel.',
    actives: [
      { name: 'Salicylic Acid', pct: '2%' },
      { name: 'Green Tea EGCG', pct: '1%' },
      { name: 'Betaine Salicylate', pct: '0.5%' }
    ],
    ingredients:
      'Aqua, Salicylic Acid 2%, Betaine, Camellia Sinensis Leaf Extract, Glycerin, Butylene Glycol, Sodium Hydroxide, Allantoin, Panthenol, Phenoxyethanol.',
    steps: [
      'Soak a cotton pad and swipe over the face after cleansing.',
      'Do not rinse. Follow with moisturiser.',
      'Begin every third night; build to nightly as tolerated.'
    ]
  },
  {
    id: 'squalane-recovery-oil',
    name: 'Squalane Recovery Oil',
    category: 'Treatment',
    concerns: ['Hydration', 'Sensitivity'],
    price: 1199,
    size: '30 ml',
    rating: 4.9,
    reviews: 856,
    badge: null,
    featured: false,
    shape: 'dropper',
    hue: 50,
    tagline: 'A single-ingredient olive-derived squalane, nothing else.',
    description:
      '100% plant-derived squalane that mimics skin\u2019s own sebum to soften, cushion and seal. Fragrance-free and non-comedogenic, it is the safest way to add lipids to a reactive routine.',
    actives: [
      { name: 'Squalane', pct: '100%' },
      { name: 'Tocopherol', pct: '0.2%' },
      { name: 'Bisabolol', pct: '0.1%' }
    ],
    ingredients:
      'Squalane (100%), Tocopherol, Bisabolol.',
    steps: [
      'Warm two to three drops between the palms.',
      'Press over moisturiser to seal, or mix into cream for extra richness.',
      'Safe for the face, neck, body and cuticles.'
    ]
  }
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getProduct(id) {
  for (var i = 0; i < PRODUCTS.length; i++) {
    if (PRODUCTS[i].id === id) return PRODUCTS[i];
  }
  return null;
}

function formatPrice(value) {
  return '\u20b9' + Number(value).toLocaleString('en-IN');
}

function productsByConcern(concern) {
  return PRODUCTS.filter(function (p) {
    return p.concerns.indexOf(concern) !== -1;
  });
}

function productsByCategory(category) {
  return PRODUCTS.filter(function (p) {
    return p.category === category;
  });
}

function priceBounds() {
  var prices = PRODUCTS.map(function (p) { return p.price; });
  return {
    min: Math.min.apply(null, prices),
    max: Math.max.apply(null, prices)
  };
}
