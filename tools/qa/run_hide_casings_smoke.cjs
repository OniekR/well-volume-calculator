const puppeteer = require('puppeteer');

(async () => {
  const url = 'http://localhost:5173/';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    // Ensure the form and some casings exist
    await page.waitForSelector('#well-form', { timeout: 5000 });
    await page.waitForSelector('.casing-input', { timeout: 5000 });

    // Capture total volume before toggling
    const beforeTotal = await page.$eval('#totalVolume', (el) => el.textContent.trim());

    // Click the hide casings button
    await page.waitForSelector('#toggle_hide_casings_btn', { timeout: 5000 });
    await page.click('#toggle_hide_casings_btn');
    await page.waitForTimeout(300);

    // Verify casings are visually hidden (computed style)
    const anyVisible = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('.casing-input'));
      return els.some((el) => getComputedStyle(el).display !== 'none');
    });

    if (anyVisible) {
      console.error('FAIL: Some casings still visible after hiding');
      await browser.close();
      process.exit(2);
    }

    // Ensure total volume didn't change
    const afterTotal = await page.$eval('#totalVolume', (el) => el.textContent.trim());
    if (beforeTotal !== afterTotal) {
      console.error('FAIL: totalVolume changed after hiding UI', { before: beforeTotal, after: afterTotal });
      await browser.close();
      process.exit(3);
    }

    console.log('PASS: Hide casings UI works and does not affect calculations');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('ERROR running hide-casings smoke test', err && err.message ? err.message : err);
    await browser.close();
    process.exit(4);
  }
})();
