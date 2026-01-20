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
    await page.waitForSelector('#upper_completion_section', { timeout: 5000 });
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

    // Set UC depths
    await page.evaluate(() => {
      const top = document.getElementById('depth_uc_top');
      const shoe = document.getElementById('depth_uc');
      const ucId = document.getElementById('upper_completion_size_id');
      if (top) top.value = '23';
      if (shoe) shoe.value = '4000';
      if (ucId) ucId.value = '4.892';
      [top, shoe, ucId].forEach(
        (el) => el && el.dispatchEvent(new Event('input', { bubbles: true }))
      );

      // Ensure small liner is enabled and overlapping
      const useSmall = document.getElementById('use_small_liner');
      if (useSmall) useSmall.checked = true;
      const topS = document.getElementById('depth_small_top');
      const shoeS = document.getElementById('depth_small');
      const drift = document.getElementById('small_liner_drift');
      if (topS) topS.value = '3691';
      if (shoeS) shoeS.value = '4992';
      if (drift) drift.value = '4.0';
      [useSmall, topS, shoeS, drift].forEach(
        (el) => el && el.dispatchEvent(new Event('input', { bubbles: true }))
      );
    });

    await (page.waitForTimeout ? page.waitForTimeout(500) : wait(500));

    const hasWarn = await page.evaluate(() => {
      const w = document.getElementById('upper_completion_fit_warning');
      return !!(w && w.textContent && w.textContent.length > 0);
    });

    if (hasWarn) {
      console.log('PASS: UC fit warning appeared');
      await browser.close();
      process.exit(0);
    }

    console.error('FAIL: UC fit warning did not appear');
    await browser.close();
    process.exit(2);
  } catch (err) {
    console.error(
      'ERROR running UC fit smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(3);
  }
})();
