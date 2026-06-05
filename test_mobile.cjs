const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:5173';

const PAGES = [
  { name: 'home', hash: '' },
  { name: 'hair', hash: 'playground' },
  { name: 'makeup', hash: 'makeup' },
  { name: 'nails', hash: 'nails' },
  { name: 'pricing', hash: 'pricing' },
  { name: 'blog', hash: 'blog' },
];

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });

  const results = [];

  for (const pg of PAGES) {
    console.log(`\n=== Testing: ${pg.name} ===`);
    
    try {
      // Navigate directly with path
      const url = pg.hash ? `${BASE_URL}/${pg.hash}` : BASE_URL;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      
      // Wait for React lazy to load
      await new Promise(r => setTimeout(r, 3000));

      // Check page content
      const bodyContent = await page.evaluate(() => {
        return {
          bodyHTML: document.body.innerHTML.length,
          hasContent: document.body.innerText.length > 100,
          title: document.title,
          hasPlaygroundGrid: !!document.querySelector('.playground-grid'),
          hasControlPanel: !!document.querySelector('.control-panel'),
          hasPreviewPanel: !!document.querySelector('.preview-panel'),
          styleCards: document.querySelectorAll('.style-card').length,
          hasDropzone: !!document.querySelector('.dropzone, .dropzone-modern'),
          bodyWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          hasOverflow: document.body.scrollWidth > window.innerWidth,
          playgroundGridStyle: (() => {
            const el = document.querySelector('.playground-grid');
            if (!el) return null;
            const cs = getComputedStyle(el);
            return { display: cs.display, gridTemplateColumns: cs.gridTemplateColumns, gap: cs.gap };
          })(),
          controlPanelOrder: (() => {
            const el = document.querySelector('.control-panel');
            if (!el) return null;
            return getComputedStyle(el).order;
          })(),
          previewPanelOrder: (() => {
            const el = document.querySelector('.preview-panel');
            if (!el) return null;
            return getComputedStyle(el).order;
          })(),
          innerText: document.body.innerText.substring(0, 200),
        };
      });

      // Take viewport screenshot
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `mobile_${pg.name}.png`), fullPage: false });

      results.push({
        page: pg.name,
        status: 'OK',
        bodyLength: bodyContent.bodyHTML,
        hasContent: bodyContent.hasContent,
        hasPlaygroundGrid: bodyContent.hasPlaygroundGrid,
        hasControlPanel: bodyContent.hasControlPanel,
        hasPreviewPanel: bodyContent.hasPreviewPanel,
        styleCards: bodyContent.styleCards,
        hasDropzone: bodyContent.hasDropzone,
        bodyWidth: bodyContent.bodyWidth,
        viewportWidth: bodyContent.viewportWidth,
        hasOverflow: bodyContent.hasOverflow,
        gridStyle: bodyContent.playgroundGridStyle,
        controlOrder: bodyContent.controlPanelOrder,
        previewOrder: bodyContent.previewPanelOrder,
      });

      console.log(`  Content length: ${bodyContent.bodyHTML}`);
      console.log(`  Has visible content: ${bodyContent.hasContent}`);
      console.log(`  Playground grid: ${bodyContent.hasPlaygroundGrid}`);
      console.log(`  Control panel: ${bodyContent.hasControlPanel}`);
      console.log(`  Preview panel: ${bodyContent.hasPreviewPanel}`);
      console.log(`  Style cards: ${bodyContent.styleCards}`);
      console.log(`  Dropzone: ${bodyContent.hasDropzone}`);
      console.log(`  Width: ${bodyContent.bodyWidth}/${bodyContent.viewportWidth} | Overflow: ${bodyContent.hasOverflow}`);
      if (bodyContent.playgroundGridStyle) {
        console.log(`  Grid: ${JSON.stringify(bodyContent.playgroundGridStyle)}`);
      }
      console.log(`  Control order: ${bodyContent.controlPanelOrder} | Preview order: ${bodyContent.previewPanelOrder}`);
      console.log(`  Preview: "${bodyContent.innerText.substring(0, 100)}..."`);

    } catch (err) {
      results.push({ page: pg.name, status: 'ERROR', error: err.message });
      console.log(`  ERROR: ${err.message}`);
    }
  }

  console.log('\n\n========== FINAL SUMMARY ==========');
  for (const r of results) {
    const isGen = ['hair', 'makeup', 'nails'].includes(r.page);
    const ok = r.status === 'OK' && r.hasContent && !r.hasOverflow;
    const genOk = !isGen || (r.hasPlaygroundGrid && r.hasControlPanel && r.hasPreviewPanel && r.styleCards > 0);
    const icon = ok && genOk ? '✅' : '❌';
    console.log(`${icon} ${r.page.padEnd(10)} | content=${r.hasContent} | overflow=${r.hasOverflow} | grid=${r.hasPlaygroundGrid} | cards=${r.styleCards} | dropzone=${r.hasDropzone}`);
  }

  await browser.close();
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
