const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const root = path.resolve(__dirname, '..', '..');
  const indexPath = 'file:' + path.join(root, 'index.html').replace(/\\/g, '/');
  const presetsPath = path.join(root, 'public', 'well-presets.json');
  let p9State = null;
  try {
    const content = JSON.parse(fs.readFileSync(presetsPath, 'utf8'));
    const payload = content.presets || content;
    if (payload && payload['P-9'] && payload['P-9'].state)
      p9State = payload['P-9'].state;
    else if (payload && payload['P-9']) p9State = payload['P-9'];
  } catch (err) {
    console.error(
      'Could not read well-presets.json:',
      err && err.message ? err.message : err
    );
    process.exit(2);
  }
  if (!p9State) {
    console.error('P-9 not found in well-presets.json');
    process.exit(3);
  }

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', (msg) =>
    console.log('PAGE_CONSOLE', msg.type(), msg.text())
  );
  page.on('pageerror', (err) =>
    console.log('PAGE_ERROR', err && err.message ? err.message : err)
  );
  try {
    await page.goto(indexPath, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    await page.waitForFunction(() => !!document.getElementById('preset_list'), {
      timeout: 5000
    });

    const PRESETS_KEY = 'well_presets_v1';
    await page.evaluate(
      (key, state) => {
        const obj = {};
        obj['P-9'] = { savedAt: Date.now(), state };
        localStorage.setItem(key, JSON.stringify(obj));
      },
      PRESETS_KEY,
      p9State
    );

    await page.evaluate(() => {
      const sel = document.getElementById('preset_list');
      sel.innerHTML = '<option value="">— Select a preset —</option>';
      const opt = document.createElement('option');
      opt.value = 'P-9';
      opt.textContent = 'P-9';
      sel.appendChild(opt);
    });

    await page.select('#preset_list', 'P-9');
    await page.click('#load_preset_btn');

    await page.waitForTimeout(100);
    const final = await page.evaluate(() => ({
      use_small_liner: !!document.getElementById('use_small_liner')?.checked,
      depth_small: document.getElementById('depth_small')?.value || ''
    }));

    console.log('Final small liner state:', final);
    if (final.use_small_liner === true && final.depth_small === '4992') {
      console.log('PASS: Small Liner expanded and seeded correctly for P-9');
      await browser.close();
      process.exit(0);
    }

    console.error('FAIL: Small Liner not as expected', final);
    await browser.close();
    process.exit(3);
  } catch (err) {
    console.error(
      'ERROR running smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(4);
  }
})();
