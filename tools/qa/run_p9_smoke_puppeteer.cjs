const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://localhost:5173/';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForSelector('#preset_list', { timeout: 5000 });
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));
    const hasP9 = await page.evaluate(() => {
      const sel = document.getElementById('preset_list');
      if (!sel) return false;
      return Array.from(sel.options).some((o) => o.value === 'P-9');
    });

    if (!hasP9) {
      console.error('FAIL: Preset P-9 not found in preset_list');
      await browser.close();
      process.exit(2);
    }

    // capture canvas image before loading preset
    const beforeCanvas = await page.evaluate(() => {
      const c = document.getElementById('wellSchematic');
      return c ? c.toDataURL() : null;
    });

    await page.select('#preset_list', 'P-9');
    await page.click('#load_preset_btn');

    await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));

    // capture canvas after loading preset to ensure name overlay is drawn
    const afterCanvas = await page.evaluate(() => {
      const c = document.getElementById('wellSchematic');
      return c ? c.toDataURL() : null;
    });

    if (beforeCanvas && afterCanvas && beforeCanvas === afterCanvas) {
      console.error(
        'FAIL: Canvas did not change after loading preset (preset label may be missing)'
      );
      await browser.close();
      process.exit(5);
    }

    const result = await page.evaluate(() => {
      const cb = document.getElementById('use_small_liner');
      const section = cb && cb.closest('.casing-input');
      const collapsed = section
        ? section.classList.contains('collapsed')
        : null;
      const depthSmall = document.getElementById('depth_small')?.value || '';
      return { checked: !!(cb && cb.checked), collapsed, depthSmall };
    });

    console.log('P-9 small liner state:', result);
    if (
      result.checked &&
      result.collapsed === false &&
      result.depthSmall === '4992'
    ) {
      console.log('PASS: Small Liner expanded and seeded correctly for P-9');
      await browser.close();
      process.exit(0);
    } else {
      console.error('FAIL: Small Liner not as expected', result);
      await browser.close();
      process.exit(3);
    }
  } catch (err) {
    console.error(
      'ERROR running smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(4);
  }
})();
