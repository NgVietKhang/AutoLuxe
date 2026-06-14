#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Import assets/Car_Specifications.xlsx into assets/js/car-data-specs-import.js
 * Run: node tools/import-car-specs.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'assets', 'Car_Specifications.xlsx');
const OUT_PATH = path.join(ROOT, 'assets', 'js', 'car-data-specs-import.js');

const MODEL_NHTSA_MAP = {
  '296 Speciale (Est.)': { model: '296 Speciale', aliases: ['296 Speciale (Est.)'] },
  '296 Speciale A (Est.)': { model: '296 Speciale A', aliases: ['296 Speciale A (Est.)'] },
  '308 Convertible (GTS)': { model: '308 Convertible', aliases: ['308 Convertible (GTS)'] }
};

/** Murcielago is updated in car-data-extended.js to avoid duplicate entries */
const SKIP_MODELS = new Set(['Murcielago']);

const HERO_IMAGES = {
  'ferrari-12cilindri': '../assets/images/cars/ferrari/12cilindri.jpg',
  'ferrari-296-speciale': '../assets/images/cars/ferrari/296-speciale.jpg',
  'ferrari-296-speciale-a': '../assets/images/cars/ferrari/296-speciale-a.jpg',
  'ferrari-3-2-mondial': '../assets/images/cars/ferrari/3.2-mondial.jpg'
};

const IMAGES_ROOT = path.join(ROOT, 'assets', 'images', 'cars');
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'webp', 'png'];

function stripAccents(value) {
  if (value === undefined || value === null) return '';
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function slugify(value) {
  return normalizeToken(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function slugWithDots(value) {
  return stripAccents(value)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugPreserveAccents(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFC')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-\u00c0-\u024f]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildModelSlugVariants(model) {
  const variants = [];
  const seen = new Set();
  function add(slug) {
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    variants.push(slug);
  }

  const plain = stripAccents(model).toLowerCase().replace(/\s+/g, ' ').trim();
  add(slugPreserveAccents(model));
  add(slugWithDots(model));
  add(slugWithDots(plain));
  add(slugify(plain));
  add(slugify(model));
  variants.slice().forEach(function (slug) {
    add(slug.replace(/-/g, '_'));
  });
  return variants;
}

function findHeroImageOnDisk(make, model) {
  const brandSlug = slugify(make);
  if (!brandSlug) return null;

  for (const modelSlug of buildModelSlugVariants(model)) {
    for (const ext of IMAGE_EXTENSIONS) {
      const folderPath = path.join(IMAGES_ROOT, brandSlug, modelSlug + '.' + ext);
      if (fs.existsSync(folderPath)) {
        return '../assets/images/cars/' + brandSlug + '/' + modelSlug + '.' + ext;
      }
      for (const sep of ['_', '-']) {
        const rootPath = path.join(IMAGES_ROOT, brandSlug + sep + modelSlug + '.' + ext);
        if (fs.existsSync(rootPath)) {
          return '../assets/images/cars/' + brandSlug + sep + modelSlug + '.' + ext;
        }
      }
    }
  }
  return null;
}

function normalizeToken(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
}

function buildStableId(make, model) {
  const raw = (normalizeToken(make) + '-' + normalizeToken(model))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return raw || 'updating-car';
}

function isInvalidRow(row) {
  const hp = row.horsepower;
  return hp === undefined || hp === null || String(hp).trim().toUpperCase() === 'N/A';
}

function parseHorsepower(value) {
  const match = String(value).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function parsePriceUSD(value) {
  const digits = String(value).replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : null;
}

function formatWeight(value) {
  const str = String(value).trim();
  const match = str.match(/^([\d,]+)\s*kg$/i);
  if (!match) return str;
  const num = match[1].replace(/,/g, '');
  const formatted = Number(num).toLocaleString('en-US');
  return formatted + ' kg';
}

function parseIntField(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(String(value).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

function toCarEntry(row) {
  const excelModel = String(row.model || '').trim();
  if (SKIP_MODELS.has(excelModel)) return null;

  const mapping = MODEL_NHTSA_MAP[excelModel];
  const model = mapping ? mapping.model : excelModel;
  const aliases = mapping ? mapping.aliases.slice() : undefined;
  const make = String(row.make || '').trim();
  const id = buildStableId(make, model);

  const entry = {
    id,
    make,
    model,
    year: parseIntField(row.year),
    horsepower: parseHorsepower(row.horsepower),
    topSpeed: String(row.topSpeed || '').trim(),
    zeroToHundred: String(row.zeroToHundred || '').trim(),
    engine: String(row.engine || '').trim(),
    drivetrain: String(row.drivetrain || '').trim(),
    torque: String(row.torque || '').trim(),
    weight: formatWeight(row.weight),
    transmission: String(row.transmission || '').trim(),
    seats: parseIntField(row.seats),
    doors: parseIntField(row.doors),
    dimensions: String(row.dimensions || '').trim(),
    fuelType: String(row.fuelType || '').trim(),
    bodyType: String(row.bodyType || '').trim(),
    priceUSD: parsePriceUSD(row.priceUSD),
    brakes: String(row.brakes || '').trim()
  };

  if (aliases && aliases.length) entry.aliases = aliases;
  if (HERO_IMAGES[id]) {
    entry.heroImage = HERO_IMAGES[id];
  } else {
    const discovered = findHeroImageOnDisk(make, model);
    if (discovered) entry.heroImage = discovered;
  }

  return entry;
}

function serializeEntry(entry) {
  const lines = ['  {'];
  const keys = Object.keys(entry);
  keys.forEach(function (key, index) {
    const val = entry[key];
    let serialized;
    if (typeof val === 'number') {
      serialized = String(val);
    } else if (Array.isArray(val)) {
      serialized = JSON.stringify(val);
    } else {
      serialized = JSON.stringify(val);
    }
    const comma = index < keys.length - 1 ? ',' : '';
    lines.push('    ' + key + ': ' + serialized + comma);
  });
  lines.push('  }');
  return lines.join('\n');
}

function main() {
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (err) {
    console.error('Missing dependency "xlsx". Run: npm install xlsx --save-dev');
    process.exit(1);
  }

  if (!fs.existsSync(XLSX_PATH)) {
    console.error('Excel file not found:', XLSX_PATH);
    process.exit(1);
  }

  const workbook = XLSX.readFile(XLSX_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const cars = [];
  let skippedInvalid = 0;
  let skippedMurcielago = 0;

  rows.forEach(function (row) {
    if (isInvalidRow(row)) {
      skippedInvalid += 1;
      return;
    }
    const excelModel = String(row.model || '').trim();
    if (SKIP_MODELS.has(excelModel)) {
      skippedMurcielago += 1;
      return;
    }
    const entry = toCarEntry(row);
    if (entry) cars.push(entry);
  });

  const body = cars.map(serializeEntry).join(',\n');

  const output = [
    '/* =============================================',
    '   CAR-DATA-SPECS-IMPORT.JS — AutoLuxe',
    '   Generated from assets/Car_Specifications.xlsx.',
    '   Run: node tools/import-car-specs.js',
    '   ============================================= */',
    '',
    'var CAR_DATABASE_SPECS_IMPORT = [',
    body,
    '];',
    '',
    'if (typeof CAR_DATABASE !== \'undefined\' && Array.isArray(CAR_DATABASE)) {',
    '  CAR_DATABASE.push.apply(CAR_DATABASE, CAR_DATABASE_SPECS_IMPORT);',
    '}',
    ''
  ].join('\n');

  fs.writeFileSync(OUT_PATH, output, 'utf8');

  console.log('Wrote', cars.length, 'cars to', OUT_PATH);
  console.log('Skipped invalid (N/A):', skippedInvalid);
  console.log('Skipped Murcielago (handled in car-data-extended.js):', skippedMurcielago);
}

main();
