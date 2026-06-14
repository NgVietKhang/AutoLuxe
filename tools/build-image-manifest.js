#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Scan assets/images/cars and emit car-image-manifest.js
 * Run: node tools/build-image-manifest.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_ROOT = path.join(ROOT, 'assets', 'images', 'cars');
const OUT_PATH = path.join(ROOT, 'assets', 'js', 'car-image-manifest.js');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.webp', '.png']);
const SKIP_FILES = new Set(['placeholder.svg']);

function toWebPath(absPath) {
  const relFromAssets = path.relative(path.join(ROOT, 'assets'), absPath).replace(/\\/g, '/');
  return '../assets/' + relFromAssets;
}

function walkImages(dir, list) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(function (entry) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkImages(full, list);
      return;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext) || SKIP_FILES.has(entry.name)) return;
    list.push(toWebPath(full));
  });
}

function collectPaths() {
  const absPaths = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        return;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext) || SKIP_FILES.has(entry.name)) return;
      absPaths.push(full);
    });
  }
  walk(IMAGES_ROOT);
  absPaths.sort();
  return absPaths.map(toWebPath);
}

function main() {
  const paths = collectPaths();
  const header = [
    '/* =============================================',
    '   CAR-IMAGE-MANIFEST.JS — AutoLuxe',
    '   Generated list of provided car images on disk.',
    '   Run: node tools/build-image-manifest.js',
    '   ============================================= */',
    '',
    'var CAR_IMAGE_MANIFEST = {',
    '  paths: ' + JSON.stringify(paths, null, 2).replace(/\n/g, '\n  ') + '',
    '};',
    ''
  ].join('\n');

  fs.writeFileSync(OUT_PATH, header, 'utf8');
  console.log('Wrote ' + paths.length + ' image paths to ' + OUT_PATH);
}

main();
