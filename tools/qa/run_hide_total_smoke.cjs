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
    await page.waitForSelector('#toggle_hide_total_btn', { timeout: 5000 });

    // capture visibility and value before
    const beforeVisible = await page.evaluate(() => {
      const el = document.querySelector('.result');
      return el && getComputedStyle(el).display !== 'none';
    });
    const beforeValue = await page.$eval('#totalVolume', (el) =>
      el.textContent.trim()
    );

    await page.click('#toggle_hide_total_btn');
    await (page.waitForTimeout ? page.waitForTimeout(300) : wait(300));

    const afterVisible = await page.evaluate(() => {
      const el = document.querySelector('.result');
      return el && getComputedStyle(el).display !== 'none';
    });
    const afterValue = await page.$eval('#totalVolume', (el) =>
      el.textContent.trim()
    );

    if (afterVisible) {
      console.error('FAIL: Total still visible after hiding');
      await browser.close();
      process.exit(2);
    }

    if (beforeValue !== afterValue) {
      console.error('FAIL: totalVolume changed after hiding UI', {
        before: beforeValue,
        after: afterValue
      });
      await browser.close();
      process.exit(3);
    }

    console.log('PASS: Hide total UI works and does not affect calculations');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(
      'ERROR running hide-total smoke test',
      err && err.message ? err.message : err
    );
    await browser.close();
    process.exit(4);
  }
})();
