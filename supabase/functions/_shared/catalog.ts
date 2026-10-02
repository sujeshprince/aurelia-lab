/* AUTO-GENERATED — do not edit by hand. Run: node tools/gen-catalog.js */
/* Single source of truth: js/data.js */

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const CATALOG: Record<string, CatalogItem> = {
  "clarify-gel-cleanser": {
    "id": "clarify-gel-cleanser",
    "name": "Clarify Gel Cleanser",
    "price": 849,
    "category": "Cleanser"
  },
  "gentle-cream-cleanser": {
    "id": "gentle-cream-cleanser",
    "name": "Gentle Cream Cleanser",
    "price": 799,
    "category": "Cleanser"
  },
  "resurface-enzyme-cleanser": {
    "id": "resurface-enzyme-cleanser",
    "name": "Resurface Enzyme Cleanser",
    "price": 949,
    "category": "Cleanser"
  },
  "niacinamide-5-serum": {
    "id": "niacinamide-5-serum",
    "name": "Niacinamide 5% Serum",
    "price": 1099,
    "category": "Serum"
  },
  "hyaluronic-hydration-serum": {
    "id": "hyaluronic-hydration-serum",
    "name": "Hyaluronic Hydration Serum",
    "price": 1199,
    "category": "Serum"
  },
  "retinol-night-serum": {
    "id": "retinol-night-serum",
    "name": "Retinol 0.3% Night Serum",
    "price": 1899,
    "category": "Serum"
  },
  "vitamin-c-15-serum": {
    "id": "vitamin-c-15-serum",
    "name": "Vitamin C 15% Serum",
    "price": 1599,
    "category": "Serum"
  },
  "azelaic-10-serum": {
    "id": "azelaic-10-serum",
    "name": "Azelaic Acid 10% Serum",
    "price": 1249,
    "category": "Serum"
  },
  "ceramide-barrier-moisturizer": {
    "id": "ceramide-barrier-moisturizer",
    "name": "Ceramide Barrier Moisturizer",
    "price": 1349,
    "category": "Moisturizer"
  },
  "oil-free-water-gel": {
    "id": "oil-free-water-gel",
    "name": "Oil-Free Water Gel",
    "price": 999,
    "category": "Moisturizer"
  },
  "rich-repair-night-cream": {
    "id": "rich-repair-night-cream",
    "name": "Rich Repair Night Cream",
    "price": 1749,
    "category": "Moisturizer"
  },
  "mineral-spf-50-fluid": {
    "id": "mineral-spf-50-fluid",
    "name": "Mineral SPF 50 Fluid",
    "price": 1099,
    "category": "SPF"
  },
  "daily-spf-30-lotion": {
    "id": "daily-spf-30-lotion",
    "name": "Daily SPF 30 Lotion",
    "price": 899,
    "category": "SPF"
  },
  "peptide-eye-concentrate": {
    "id": "peptide-eye-concentrate",
    "name": "Peptide Eye Concentrate",
    "price": 1449,
    "category": "Treatment"
  },
  "bha-2-clarifying-solution": {
    "id": "bha-2-clarifying-solution",
    "name": "BHA 2% Clarifying Solution",
    "price": 749,
    "category": "Treatment"
  },
  "squalane-recovery-oil": {
    "id": "squalane-recovery-oil",
    "name": "Squalane Recovery Oil",
    "price": 1199,
    "category": "Treatment"
  }
};

/* Delivery rules (must match the front-end copy in cart.js / checkout.js) */
export const SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;
export const MAX_LINE_QTY = 99;
export const MAX_SUBTOTAL = 100000;
