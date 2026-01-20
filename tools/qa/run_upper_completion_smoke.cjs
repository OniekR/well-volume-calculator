const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, 'upper_completion_smoke.log');
function flog(msg) {
  const ts = new Date().toISOString();
  const line = `${ts} ${msg}\n`;
  try {
    fs.appendFileSync(logPath, line);
  } catch (e) {
    // ignore logging failures
  }
}

let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (err) {
  const msg =
    'PUPPETEER_REQUIRE_ERR: ' +
    (err && err.message ? err.message : String(err));
  console.error(msg);
  flog(msg);
  process.exit(8);
}
console.log('SMOKE: Starting upper completion smoke test');
flog('SMOKE: Starting upper completion smoke test');

// Safety watchdog: fail after 30s to avoid hanging CI
const WATCHDOG_MS = 30000;
let watchdog = setTimeout(() => {
  const msg = 'SMOKE: Watchdog timeout - test did not complete within 30s';
  console.error(msg);
  flog(msg);
  process.exit(7);
}, WATCHDOG_MS);

(async () => {
  console.log('SMOKE: entering main IIFE');
  flog('SMOKE: entering main IIFE');
  const url = 'http://localhost:5173/';
  console.log('SMOKE: launching puppeteer');
  flog('SMOKE: launching puppeteer');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('SMOKE: puppeteer launched');
  flog('SMOKE: puppeteer launched');
  const page = await browser.newPage();
  console.log('SMOKE: new page created');
  flog('SMOKE: new page created');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    console.log('SMOKE: going to', url);
    flog('SMOKE: going to ' + url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    console.log('SMOKE: page.goto succeeded');
    flog('SMOKE: page.goto succeeded');
    await page.waitForSelector('#upper_completion_size', { timeout: 10000 });
    console.log('SMOKE: found #upper_completion_size');
    flog('SMOKE: found #upper_completion_size');

    // ensure UI present
    const exists = await page.$eval('#upper_completion_size', (el) => !!el);
    if (!exists) {
      console.error('FAIL: Upper completion UI not found');
      await browser.close();
      process.exit(2);
    }

    // Set top and depth and ensure table includes row
    await page.$eval('#depth_uc_top', (el) => (el.value = '10'));
    await page.$eval('#depth_uc', (el) => (el.value = '60'));
    await page.$eval('#use_upper_completion', (el) => (el.checked = true));
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

    // Trigger recalculation by dispatching input event
    await page.$eval('#depth_uc', (el) =>
      el.dispatchEvent(new Event('input', { bubbles: true }))
    );
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

    const tableHas = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll('#casingVolumes tbody tr')
      );
      return rows.some(
        (r) =>
          r.children &&
          r.children[0] &&
          r.children[0].textContent.trim() === 'Upper completion'
      );
    });

    if (!tableHas) {
      console.error('FAIL: Upper completion not present in volume table');
      await browser.close();
      process.exit(3);
    }

    // Ensure canvas changes when the upper completion depths are set
    const before = await page.evaluate(() =>
      document.getElementById('wellSchematic').toDataURL()
    );
    await page.$eval('#depth_uc', (el) => (el.value = '80'));
    await page.$eval('#depth_uc', (el) =>
      el.dispatchEvent(new Event('input', { bubbles: true }))
    );
    await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));
    const after = await page.evaluate(() =>
      document.getElementById('wellSchematic').toDataURL()
    );

    if (before === after) {
      console.error(
        'FAIL: Canvas did not update when changing upper completion'
      );
      await browser.close();
      process.exit(4);
    }

    // Now, test TJ vs drift validation: add a production drift input with value smaller than TJ
    await page.evaluate(() => {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.id = 'production_drift';
      inp.value = '6.0';
      document.getElementById('well-form').appendChild(inp);
    });

    // Ensure UC is placed within production casing by setting production top/depth
    await page.$eval('#depth_7_top', (el) => (el.value = '0'));
    await page.$eval('#depth_7', (el) => (el.value = '200'));

    // Trigger recalculation
    await page.$eval('#depth_uc', (el) =>
      el.dispatchEvent(new Event('input', { bubbles: true }))
    );
    await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));

    // Wait up to 2s for either the new or legacy warning element to appear with relevant text
    try {
      await page.waitForFunction(
        () => {
          const ids = [
            'upper_completion_fit_warning',
            'upper_completion_warning'
          ];
          for (const id of ids) {
            const el = document.getElementById(id);
            if (
              el &&
              getComputedStyle(el).display !== 'none' &&
              el.textContent.includes('does not fit')
            ) {
              return true;
            }
          }
          return false;
        },
        { timeout: 2000 }
      );
    } catch (err) {
      console.error(
        'FAIL: Upper completion warning not shown when TJ > casing drift'
      );
      await browser.close();
      process.exit(6);
    }

    console.log(
      'PASS: Upper completion UI present, affects table, updates canvas, and shows TJ drift warning when applicable'
    );
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(
      'ERROR running upper completion smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(5);
  }
})();
