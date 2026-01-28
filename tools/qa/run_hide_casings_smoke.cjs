const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://localhost:5173/';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // capture console messages for debugging
  const consoleMessages = [];
  page.on('console', (msg) => {
    try {
      const args = msg.args
        ? msg.args().map((a) => a.toString && a.toString())
        : [];
      consoleMessages.push({ type: msg.type(), text: msg.text(), args });
    } catch (e) {
      consoleMessages.push({ type: 'error', text: String(msg) });
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    // Ensure the form and some casings exist
    await page.waitForSelector('#well-form', { timeout: 5000 });
    await page.waitForSelector('.casing-input', { timeout: 5000 });

    // Note: totalVolume UI was removed from the application. Readiness and stability
    // are now determined from per-casing volume table values instead of a single total.

    // Ensure built-in presets (e.g., P-9) have loaded and initial calculations completed.
    // Prefer loading P-9 if present to seed known values; otherwise wait for per-casing volumes to populate.
    const waitForInitialPerCasing = async (timeout = 5000) => {
      const start = Date.now();

      // If preset P-9 exists, load it to seed values
      try {
        const hasP9 = await page.evaluate(() => {
          const sel = document.getElementById('preset_list');
          if (!sel) return false;
          return Array.from(sel.options).some((o) => o.value === 'P-9');
        });
        if (hasP9) {
          await page.select('#preset_list', 'P-9');
          await page.click('#load_preset_btn');
          // wait a bit for preset to apply and recalc
          await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));
        }
      } catch (e) {
        // ignore
      }

      // Wait until at least one per-casing volume is non-empty and not '0.00 m³'
      let per = await page.evaluate(readPerCasingVolume);
      while (Date.now() - start < timeout) {
        const values = Object.values(per || {});
        if (values.some((v) => v && v !== '0.00 m³')) return per;
        await (page.waitForTimeout ? page.waitForTimeout(150) : wait(150));
        per = await page.evaluate(readPerCasingVolume);
      }
      return per;
    };

    const readPerCasingVolume = () =>
      Array.from(document.querySelectorAll('#casingVolumes tbody tr')).reduce(
        (acc, tr) => {
          const name = tr.children[0] && tr.children[0].textContent.trim();
          const vol = tr.children[1] && tr.children[1].textContent.trim();
          if (name && vol) acc[name] = vol;
          return acc;
        },
        {}
      );

    const beforePer = await waitForInitialPerCasing();

    // Helper: robust click with fallbacks and debug artifact capture
    async function safeClick(selector, options = {}) {
      const timeout = options.timeout || 5000;
      await page.waitForSelector(selector, { timeout });
      const el = await page.$(selector);
      if (!el) throw new Error(`Element not found for selector ${selector}`);

      // Ensure element is in view
      await el.evaluate((e) => e.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' }));
      await (page.waitForTimeout ? page.waitForTimeout(100) : wait(100));

      try {
        await el.click();
      } catch (err) {
        // Fallback: attempt DOM click
        try {
          await el.evaluate((e) => e.click());
        } catch (err2) {
          // Capture debug artifacts for CI
          try {
            const fs = require('fs');
            const path = require('path');
            const outDir = path.resolve(__dirname, 'artifacts');
            if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
            const screenshotPath = path.join(outDir, `hide-casings-click-fail-${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
            const html = await page.evaluate((sel) => {
              const el = document.querySelector(sel);
              return el ? el.outerHTML : document.documentElement.outerHTML;
            }, selector);
            fs.writeFileSync(path.join(outDir, `hide-casings-click-fail-${Date.now()}.html`), html || '');
            console.error('DEBUG: artifacts written to', outDir);
          } catch (writeErr) {
            console.error('DEBUG: failed to write artifacts', writeErr && writeErr.message ? writeErr.message : writeErr);
          }

          throw new Error(`Failed to click selector ${selector}: ${err.message}; fallback error: ${err2 && err2.message ? err2.message : err2}`);
        }
      }

      await (page.waitForTimeout ? page.waitForTimeout(options.wait || 300) : wait(options.wait || 300));
    }

    // Click the hide casings button
    await safeClick('#toggle_hide_casings_btn', { timeout: 5000, wait: 300 });

    // Verify casings are visually hidden (computed style)
    const visibleOthers = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('.casing-input'));
      // count visible casing-inputs that are NOT marked .no-hide
      return els.filter(
        (el) =>
          !el.classList.contains('no-hide') &&
          getComputedStyle(el).display !== 'none'
      ).length;
    });

    const visibleNoHide = await page.evaluate(() => {
      const el = document.querySelector('.casing-input.no-hide');
      return el ? getComputedStyle(el).display !== 'none' : false;
    });

    if (visibleOthers > 0) {
      console.error(
        'FAIL: Some non-exempt casings are still visible after hiding'
      );
      await browser.close();
      process.exit(2);
    }

    if (!visibleNoHide) {
      console.error(
        'FAIL: The no-hide casing (e.g., Upper completion) was hidden unexpectedly'
      );
      await browser.close();
      process.exit(3);
    }

    // Also assert specific per-casing volumes (Reservoir and Small liner) didn't change

    const afterPer = await page.evaluate(readPerCasingVolume);
    const reservoirBefore = beforePer['Reservoir'];
    const reservoirAfter = afterPer['Reservoir'];
    const smallBefore = beforePer['Small liner'];
    const smallAfter = afterPer['Small liner'];

    if (reservoirBefore !== reservoirAfter || smallBefore !== smallAfter) {
      // Gather debugging info so we can see what changed on the page
      const inputsSnapshot = await page.evaluate(() => ({
        depth_reservoir_top:
          document.getElementById('depth_5_top')?.value || '',
        depth_reservoir_shoe: document.getElementById('depth_5')?.value || '',
        reservoir_size_id:
          document.getElementById('reservoir_size_id')?.value || '',
        reservoir_drift:
          document.getElementById('reservoir_drift')?.value || '',
        depth_small_top:
          document.getElementById('depth_small_top')?.value || '',
        depth_small_shoe: document.getElementById('depth_small')?.value || '',
        small_liner_size_id:
          document.getElementById('small_liner_size_id')?.value || '',
        small_liner_drift:
          document.getElementById('small_liner_drift')?.value || ''
      }));

      const tableHtml = await page.$eval('#casingVolumes', (t) => t.outerHTML);

      // Write artifacts to disk for CI debugging (if running in Actions these files can be uploaded)
      try {
        const fs = require('fs');
        const path = require('path');
        const outDir = path.resolve(__dirname, 'artifacts');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(
          path.join(outDir, `hide-casings-snapshot-${Date.now()}.json`),
          JSON.stringify(
            {
              reservoirBefore,
              reservoirAfter,
              smallBefore,
              smallAfter,
              inputsSnapshot,
              consoleMessages
            },
            null,
            2
          )
        );
        fs.writeFileSync(
          path.join(outDir, `hide-casings-table-${Date.now()}.html`),
          tableHtml || ''
        );
        console.error('Debug artifacts written to', outDir);
      } catch (err) {
        console.error(
          'Failed to write debug artifacts',
          err && err.message ? err.message : err
        );
      }

      console.error('FAIL: A per-casing volume changed after hiding UI', {
        reservoirBefore,
        reservoirAfter,
        smallBefore,
        smallAfter,
        inputsSnapshot,
        tableHtml: tableHtml && tableHtml.slice(0, 4000) // limit size
      });
      await browser.close();
      process.exit(3);
    }

    console.log('PASS: Hide casings UI works and does not affect calculations');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(
      'ERROR running hide-casings smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(4);
  }
})();
