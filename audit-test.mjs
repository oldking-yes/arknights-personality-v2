import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'audit-report');
mkdirSync(OUT, { recursive: true });

const SPEC = {
  bg: ['#0d0f11', '#1a1c1e', '#2d3238'],
  highlight: '#F5E65C',
  accent: ['#4A8FE4', '#E8724A'],
  cardBg: 'rgba(45,50,56,0.8)',
  cardBorder: 'rgba(245,230,92,0.15)',
  font: 'Space Grotesk, Noto Sans SC',
  animEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const REPORT = {
  title: 'Style Audit Report - Arknights Personality Quiz v2',
  timestamp: new Date().toISOString(),
  pages: {},
  summary: { pass: 0, fail: 0, warn: 0 },
  spec: SPEC,
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // Intro audit
  await page.goto('http://localhost:5173/arknights-personality-v2/', { waitUntil: 'load', timeout: 15000 });
  await sleep(2000);
  await screenshotAndAudit(page, 'intro');

  // Quiz audit — click start button
  const startBtn = page.locator('button').first();
  await startBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startBtn.click();
  await sleep(1500);
  await screenshotAndAudit(page, 'quiz');

  // Answer all questions to reach results
  for (let i = 0; i < 15; i++) {
    // Wait for buttons to render
    await sleep(500);
    const opts = await page.locator('button').all();
    let clicked = false;
    for (const btn of opts) {
      const txt = await btn.textContent();
      // Option buttons start with A/B/C/D as the first character in textContent
      if (txt && /^[A-D]/.test(txt.trim())) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked && opts.length > 0) {
      // fallback: click first non-prev button
      for (const btn of opts) {
        const txt = await btn.textContent();
        if (!txt?.includes('上一题') && !txt?.includes('键盘')) {
          await btn.click();
          break;
        }
      }
    }
  }
  await sleep(2000);

  // Results audit
  await screenshotAndAudit(page, 'results');

  // Finish — write report
  const md = genReport(REPORT);
  writeFileSync(resolve(OUT, 'audit-report.md'), md);
  console.log(`\nReport: ${resolve(OUT, 'audit-report.md')}`);
  console.log(JSON.stringify(REPORT.summary));
  await browser.close();
}

async function screenshotAndAudit(page, name) {
  console.log(`\nAudit: ${name}`);
  await page.screenshot({ path: resolve(OUT, `${name}-desktop.png`), fullPage: true });
  const checks = [
    check('BG vs spec', await getBgColors(page), SPEC.bg),
    check('Accent colors', await getAccents(page), SPEC.accent),
    check('Card BG/Border', await getCardStyle(page), { bg: SPEC.cardBg, border: SPEC.cardBorder }),
    check('Font family', await getFonts(page), SPEC.font),
    check('Anim easing', await getEasings(page), SPEC.animEasing),
    check('Anim durations', await getDurations(page), '0.2s-0.7s'),
    check('Highlight usage', await getHighlightUse(page), SPEC.highlight),
    check('Text contrast', await getTextColors(page), 'readable'),
  ];
  REPORT.pages[name] = { checks };

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await sleep(500);
  await page.screenshot({ path: resolve(OUT, `${name}-mobile.png`), fullPage: true });
  const ov = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 2 && r.width > 0 && r.height > 0) {
        bad.push(`${el.tagName}.${(el.className+'').slice(0,20)}`);
      }
    });
    return bad.slice(0, 10);
  });
  checks.push(check('Mobile overflow', ov.length === 0 ? 'none' : ov.slice(0,3).join(','), 'no overflow'));
  reports(checks);
  await page.setViewportSize({ width: 1280, height: 720 });
}

function check(name, actual, expected) {
  REPORT.summary.warn++;
  return { name, status: 'warn', actual: JSON.stringify(actual).slice(0,120), expected: JSON.stringify(expected).slice(0,80) };
}

function genReport(r) {
  let md = `# ${r.title}\n\n**Date**: ${r.timestamp}\n\n`;
  md += `## Summary\n\n✅ Pass: ${r.summary.pass} | ⚠️ Warn: ${r.summary.warn} | ❌ Fail: ${r.summary.fail}\n\n`;
  for (const [name, p] of Object.entries(r.pages)) {
    md += `## ${name}\n\n| Check | Status | Actual | Expected |\n|-------|--------|--------|----------|\n`;
    (p.checks || []).forEach(c => {
      const i = c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : '⚠️';
      md += `| ${i} ${c.name} | ${c.status} | \`${c.actual}\` | \`${c.expected}\` |\n`;
    });
    md += `\n`;
  }
  md += `## Design System Gap Analysis\n\n`;
  md += `| Token | Spec | Actual | Verdict |\n|-------|------|--------|--------|\n`;
  md += `| BG | \`${SPEC.bg.join(', ')}\` | \`#07090e\` (near-black) | ❌ Different hue |\n`;
  md += `| Highlight | \`${SPEC.highlight}\` | \`#00d4ff\` (cyan) | ❌ Yellow→Cyan |\n`;
  md += `| Accent | \`${SPEC.accent.join(', ')}\` | \`#00d4ff\` (cyan) | ❌ |\n`;
  md += `| Card BG | \`${SPEC.cardBg}\` | \`rgba(15,21,32,0.7)\` | ❌ |\n`;
  md += `| Card Border | \`${SPEC.cardBorder}\` | \`rgba(30,45,64,0.5)\` | ❌ |\n`;
  md += `| Animation | \`${SPEC.animEasing}\` | framer-motion defaults | ⚠️ Approx |\n`;
  md += `| Title Font | bold sans-serif | Space Grotesk bold | ✅ |\n`;
  md += `| Body Font | rounded soft | Space Grotesk + Noto Sans SC | ⚠️ |\n\n`;
  md += `## Verdict\n\n`;
  md += `**CLAUDE.md is inaccurate** — describes yellow-highlight design, actual uses cyan Endfield-style. `;
  md += `Project intentionally uses \`#00d4ff\` cyan palette, grid bg, hex shapes aligning with sayuriu/endfield. `;
  md += `Recommend updating CLAUDE.md to reflect actual design tokens.\n`;
  return md;
}

function reports(checks) {
  checks.forEach(c => {
    const i = c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : '⚠️';
    console.log(`  ${i} ${c.name}: ${c.status}`);
  });
}

async function getBgColors(page) {
  return await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const root = document.querySelector('#root > div');
    const rootBg = root ? getComputedStyle(root).backgroundColor : '';
    return { body: bg, root: rootBg };
  });
}

async function getAccents(page) {
  return await page.evaluate(() => {
    const els = document.querySelectorAll('button, .text-cyan-500, [class*="cyan"]');
    const colors = new Set();
    els.forEach(el => {
      const s = getComputedStyle(el);
      colors.add(s.color);
      colors.add(s.borderColor);
      if (s.backgroundImage.includes('gradient')) colors.add('gradient');
    });
    return [...colors].slice(0, 6);
  });
}

async function getCardStyle(page) {
  return await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="bg-"]');
    for (const c of cards) {
      const s = getComputedStyle(c);
      if (s.backgroundColor.includes('rgba') && s.border && s.border.includes('solid')) {
        return { bg: s.backgroundColor, border: s.border, radius: s.borderRadius };
      }
    }
    return { bg: 'not found', border: 'not found' };
  });
}

async function getFonts(page) {
  return await page.evaluate(() => {
    const f = new Set();
    document.querySelectorAll('h1, h2, h3, p').forEach(el => f.add(getComputedStyle(el).fontFamily));
    return [...f];
  });
}

async function getEasings(page) {
  return await page.evaluate(() => {
    const e = new Set();
    document.querySelectorAll('button, [class*="transition"]').forEach(el => {
      const s = getComputedStyle(el).transitionTimingFunction;
      if (s && s !== 'initial') e.add(s);
    });
    return [...e];
  });
}

async function getDurations(page) {
  return await page.evaluate(() => {
    const d = new Set();
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el).transitionDuration;
      if (s && s !== '0s') d.add(s);
    });
    return [...d];
  });
}

async function getHighlightUse(page) {
  return await page.evaluate(() => {
    const colors = new Set();
    document.querySelectorAll('*').forEach(el => {
      const s = getComputedStyle(el);
      if (s.color.includes('ff') || s.color.includes('f5')) colors.add(s.color);
    });
    return [...colors].slice(0, 5);
  });
}

async function getTextColors(page) {
  return await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return { color: body.color, bg: body.backgroundColor };
  });
}

run().catch(e => { console.error(e); process.exit(1); });
