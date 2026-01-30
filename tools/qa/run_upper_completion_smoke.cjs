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
// Synchronously note that the script was invoked so we have a durable trace even
// if early async operations (like puppeteer launch) fail or hang.
try {
  fs.appendFileSync(logPath, `${new Date().toISOString()} SCRIPT_INVOKED\n`);
} catch (e) {
  /* ignore */
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
    // Wait for the Upper Completion section and then for a size control.
    // New UI uses dynamic tubing inputs (#tubing_size_0) while older UI used
    // a legacy select (#upper_completion_size). Accept either.
    await page.waitForSelector('#upper_completion_section', { timeout: 10000 });

    let foundSizeSelector = null;
    try {
      await page.waitForSelector('#upper_completion_size', { timeout: 3000 });
      foundSizeSelector = '#upper_completion_size';
      console.log('SMOKE: found legacy #upper_completion_size');
      flog('SMOKE: found legacy #upper_completion_size');
    } catch (e) {
      // Fallback to new tubing inputs
      await page.waitForSelector('#tubing_size_0', { timeout: 10000 });
      foundSizeSelector = '#tubing_size_0';
      console.log('SMOKE: found #tubing_size_0');
      flog('SMOKE: found #tubing_size_0');
    }

    // ensure UI present
    const exists = await page.$eval(foundSizeSelector, (el) => !!el);
    if (!exists) {
      console.error('FAIL: Upper completion UI not found');
      await browser.close();
      process.exit(2);
    }

    // Set top and depth and ensure table includes row
    // If we detected the legacy inputs, set them directly. If the new tubing
    // inputs are present, set tubing length to achieve a shoe depth (top is
    // typically 0 for a single tubing) so the UC is present in the well.
    if (foundSizeSelector === '#upper_completion_size') {
      await page.$eval('#depth_uc_top', (el) => (el.value = '10'));
      await page.$eval('#depth_uc', (el) => (el.value = '60'));
      await page.$eval('#use_upper_completion', (el) => (el.checked = true));
      await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

      // Trigger recalculation by dispatching input event
      await page.$eval('#depth_uc', (el) =>
        el.dispatchEvent(new Event('input', { bubbles: true }))
      );
    } else if (foundSizeSelector === '#tubing_size_0') {
      // Ensure single tubing configuration if count buttons exist
      try {
        await page.$eval('#tubing_count_1', (el) => el.click());
      } catch (e) {
        // ignore if count button not present
      }
      // Select a tubing size (prefer index 1 if available) and set length to 60m
      try {
        await page.$eval('#tubing_size_0', (el) => {
          if (el.options && el.options.length > 1)
            el.value = String(Math.min(1, el.options.length - 1));
        });
      } catch (e) {}

      await page.$eval('#use_upper_completion', (el) => (el.checked = true));
      await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

      try {
        await page.$eval('#tubing_length_0', (el) => (el.value = '60'));
        await page.$eval('#tubing_length_0', (el) =>
          el.dispatchEvent(new Event('input', { bubbles: true }))
        );
      } catch (e) {}
    }
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

    const tableHas = await page.evaluate(() => {
      const table = document.getElementById('upperCompletionVolumes');
      if (!table) return false;
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      // Confirm UC has data by checking for a totals row rendered by the app
      return rows.some(
        (r) => r.classList && r.classList.contains('totals-row')
      );
    });

    if (!tableHas) {
      flog('FAIL: Upper completion not present in UC breakdown table');
      console.error('FAIL: Upper completion not present in UC breakdown table');
      await browser.close();
      process.exit(3);
    }
    flog('UC breakdown table contains totals row');

    // Ensure canvas changes when the upper completion depths are set
    flog('Capturing canvas before change');
    const before = await page.evaluate(() =>
      document.getElementById('wellSchematic').toDataURL()
    );
    flog('Setting depth_uc to 80 (or tubing length when tubing UI present)');

    // Set depth based on which UI is present
    if (foundSizeSelector === '#upper_completion_size') {
      await page.$eval('#depth_uc', (el) => (el.value = '80'));
      flog('Dispatching input event for depth_uc');
      await page.$eval('#depth_uc', (el) =>
        el.dispatchEvent(new Event('input', { bubbles: true }))
      );
    } else if (foundSizeSelector === '#tubing_size_0') {
      await page.$eval('#tubing_length_0', (el) => (el.value = '80'));
      flog('Dispatching input event for tubing_length_0');
      await page.$eval('#tubing_length_0', (el) =>
        el.dispatchEvent(new Event('input', { bubbles: true }))
      );
      // Force recalculation and drawing multiple times to ensure it actually happens on slow CI
      // requestAnimationFrame may not fire reliably in headless environments
      flog('Forcing recalculation and draw cycles');
      try {
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => {
            if (window.__TEST_force_recalc) {
              window.__TEST_force_recalc();
            }
            // Also flush any requestAnimationFrame callbacks by giving the event loop a chance
            return new Promise(resolve => setTimeout(resolve, 50));
          });
        }
      } catch (e) {
        flog('Force recalc error: ' + (e.message || e));
      }
    }

    // Wait until the canvas dataURL changes, or timeout after a short while
    try {
      await page.waitForFunction(
        (prev) => document.getElementById('wellSchematic').toDataURL() !== prev,
        { timeout: 8000 },
        before
      );
    } catch (e) {
      // If the wait times out we still capture the canvas for debugging
    }
    flog('Capturing canvas after change');
    const after = await page.evaluate(() =>
      document.getElementById('wellSchematic').toDataURL()
    );

    if (before === after) {
      flog('FAIL: Canvas did not update when changing upper completion');
      console.error(
        'FAIL: Canvas did not update when changing upper completion'
      );

      // Gather extra debug info to help investigate flaky failures on CI
      try {
        const extra = await page.evaluate(() => {
          const c = document.getElementById('wellSchematic');
          return {
            forceRecalcAvailable: !!window.__TEST_force_recalc,
            forceRecalcResult:
              typeof window.__TEST_force_recalc === 'function'
                ? window.__TEST_force_recalc()
                : null,
            dumpState:
              typeof window.__TEST_dumpState === 'function'
                ? window.__TEST_dumpState()
                : null,
            canvasWidth: c ? c.width : null,
            canvasHeight: c ? c.height : null,
            dataURLSample: c ? c.toDataURL().slice(0, 200) : null
          };
        });

        const fs = require('fs');
        const path = require('path');
        const outDir = path.resolve(__dirname, 'artifacts');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
          path.join(outDir, `uc-canvas-debug-${Date.now()}.json`),
          JSON.stringify(extra, null, 2)
        );
        console.error('Extra debug artifacts written to', outDir, extra);
      } catch (derr) {
        console.error(
          'Failed to capture extra debug artifacts',
          derr && derr.message ? derr.message : derr
        );
      }

      await browser.close();
      process.exit(4);
    }
    flog('Canvas updated after changing upper completion');

    // Now, test TJ vs drift validation: add a production drift input with value smaller than TJ
    flog(
      'Adding or updating production drift input and setting production casing extents'
    );
    await page.evaluate(() => {
      const existing = document.getElementById('production_drift');
      if (existing) {
        existing.value = '4.0';
      } else {
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.id = 'production_drift';
        inp.value = '4.0';
        document.getElementById('well-form').appendChild(inp);
      }
    });

    // Ensure UC is placed within production casing by setting production top/depth
    await page.$eval('#depth_7_top', (el) => (el.value = '0'));
    await page.$eval('#depth_7', (el) => (el.value = '200'));

    // Trigger recalculation and notify change to production_drift
    flog('Triggering recalculation after setting production drift');
    await page.$eval('#production_drift', (el) =>
      el.dispatchEvent(new Event('input', { bubbles: true }))
    );

    // Dispatch input on the appropriate UC depth element
    if (foundSizeSelector === '#upper_completion_size') {
      await page.$eval('#depth_uc', (el) =>
        el.dispatchEvent(new Event('input', { bubbles: true }))
      );
    } else if (foundSizeSelector === '#tubing_size_0') {
      await page.$eval('#tubing_length_0', (el) =>
        el.dispatchEvent(new Event('input', { bubbles: true }))
      );
    }

    await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));

    // Wait up to 5s for either the new or legacy warning element to appear with relevant text
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
              (el.textContent.includes('does not fit') ||
                el.textContent.includes('May not fit') ||
                el.textContent.includes('exceeds'))
            ) {
              return true;
            }
          }
          return false;
        },
        { timeout: 5000 }
      );
      flog('PASS: Upper completion UI present and drift warning shown');
      console.log(
        'PASS: Upper completion UI present, affects table, updates canvas, and shows TJ drift warning when applicable'
      );
      flog('TEST_END');
      await browser.close();
      process.exit(0);
    } catch (err) {
      flog('FAIL: Upper completion warning not shown when TJ > casing drift');
      console.error(
        'FAIL: Upper completion warning not shown when TJ > casing drift'
      );

      // Gather debug info for CI artifacts
      try {
        const info = await page.evaluate(() => ({
          production_drift:
            document.getElementById('production_drift')?.value || null,
          upper_completion_size_id:
            document.getElementById('upper_completion_size_id')?.value || null,
          uc_top: document.getElementById('depth_uc_top')?.value || null,
          uc_shoe: document.getElementById('depth_uc')?.value || null,
          production_top: document.getElementById('depth_7_top')?.value || null,
          production_shoe: document.getElementById('depth_7')?.value || null,
          warning_el:
            document.getElementById('upper_completion_fit_warning')
              ?.textContent || null,
          uc_table:
            document.getElementById('upperCompletionVolumes')?.outerHTML || null
        }));

        const fs = require('fs');
        const path = require('path');
        const outDir = path.resolve(__dirname, 'artifacts');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
          path.join(outDir, `uc-debug-${Date.now()}.json`),
          JSON.stringify(info, null, 2)
        );
        console.error('Debug artifacts written to', outDir, info);
      } catch (derr) {
        console.error(
          'Failed to capture debug artifacts',
          derr && derr.message ? derr.message : derr
        );
      }

      flog('TEST_END');
      await browser.close();
      process.exit(6);
    }
  } catch (err) {
    console.error(
      'ERROR running upper completion smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(5);
  }
})();
