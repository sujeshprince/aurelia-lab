#!/usr/bin/env node
/* ==========================================================================
   AURELIA LAB — tools/gen-catalog.js
   Regenerates supabase/functions/_shared/catalog.ts from js/data.js so the
   edge functions always validate orders against the real product prices.

   Run:  node tools/gen-catalog.js   (from the repo root)
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'js', 'data.js');
const outPath = path.join(root, 'supabase', 'functions', '_shared', 'catalog.ts');

const code = fs.readFileSync(dataPath, 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code, ctx);

const products = Array.isArray(ctx.PRODUCTS) ? ctx.PRODUCTS : [];
const catalog = {};
products.forEach((p) => {
  catalog[p.id] = {
    id: String(p.id),
    name: String(p.name || p.id),
    price: Number(p.price) || 0,
    category: String(p.category || ''),
  };
});

const lines = [
  '/* AUTO-GENERATED — do not edit by hand. Run: node tools/gen-catalog.js */',
  '/* Single source of truth: js/data.js */',
  '',
  'export interface CatalogItem {',
  '  id: string;',
  '  name: string;',
  '  price: number;',
  '  category: string;',
  '}',
  '',
  'export const CATALOG: Record<string, CatalogItem> = ' + JSON.stringify(catalog, null, 2) + ';',
  '',
  '/* Delivery rules (must match the front-end copy in cart.js / checkout.js) */',
  'export const SHIPPING_THRESHOLD = 1999;',
  'export const SHIPPING_FEE = 99;',
  'export const MAX_LINE_QTY = 99;',
  'export const MAX_SUBTOTAL = 100000;',
  '',
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n'));
console.log('Wrote ' + path.relative(root, outPath) + ' (' + products.length + ' products)');