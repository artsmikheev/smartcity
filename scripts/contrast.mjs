#!/usr/bin/env node
// WCAG relative luminance: linear sRGB, then (Llighter + .05)/(Ldarker + .05).
import { pathToFileURL } from 'node:url';

export function luminance(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Use #RRGGBB colors.');
  const linear = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [foreground, background] = process.argv.slice(2);
  if (!foreground || !background) {
    console.error('Usage: node scripts/contrast.mjs "#EDEAE4" "#1C1B1A"');
    process.exitCode = 1;
  } else {
    const ratio = contrast(foreground, background);
    console.log(`${foreground} / ${background}: ${ratio.toFixed(2)}:1 | normal AA ${ratio >= 4.5 ? 'PASS' : 'FAIL'} | large/UI AA ${ratio >= 3 ? 'PASS' : 'FAIL'}`);
  }
}
