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
    // Ensure the form and some casings exist
    await page.waitForSelector('#well-form', { timeout: 5000 });
    await page.waitForSelector('.casing-input', { timeout: 5000 });

    // Capture total volume before toggling
    const beforeTotal = await page.$eval('#totalVolume', (el) =>
      el.textContent.trim()
    );

    // Click the hide casings button
    await page.waitForSelector('#toggle_hide_casings_btn', { timeout: 5000 });
    await page.click('#toggle_hide_casings_btn');
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

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

    // Ensure total volume didn't change
    const afterTotal = await page.$eval('#totalVolume', (el) =>
      el.textContent.trim()
    );
    if (beforeTotal !== afterTotal) {
      console.error('FAIL: totalVolume changed after hiding UI', {
        before: beforeTotal,
        after: afterTotal
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
