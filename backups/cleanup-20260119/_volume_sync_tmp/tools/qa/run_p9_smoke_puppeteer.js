const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://localhost:5173/';
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    // Wait until preset_list is populated (max 5s)
    await page.waitForSelector('#preset_list', { timeout: 5000 });
    // Wait a short time to let built-in presets load
    await page.waitForTimeout(300);
    // Ensure option P-9 exists
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

    // Select P-9 and click Load
    await page.select('#preset_list', 'P-9');
    await page.click('#load_preset_btn');

    // Wait for the UI to stabilize
    await page.waitForTimeout(500);

    // Check Small Liner checkbox and collapsed state and depth_small value
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
