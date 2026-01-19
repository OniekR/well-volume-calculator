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
    await page.waitForSelector('#upper_completion_size', { timeout: 5000 });

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

    const warningVisible = await page.evaluate(() => {
      const el = document.getElementById('upper_completion_warning');
      return (
        el &&
        getComputedStyle(el).display !== 'none' &&
        el.textContent.includes('does not fit')
      );
    });

    if (!warningVisible) {
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
