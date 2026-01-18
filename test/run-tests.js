const fs = require("fs");
const path = require("path");

const testDir = path.join(__dirname);
const files = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith(".spec.js") || f.endsWith(".test.js"));

if (!files.length) {
  console.log("No unit tests found.");
}

(async () => {
  let failures = 0;
  for (const f of files) {
    const full = path.join(testDir, f);
    console.log(`Running ${f}...`);
    try {
      const ret = require(full);
      if (ret && typeof ret.then === "function") {
        await ret;
      }
      console.log(`[PASS] ${f}`);
    } catch (err) {
      console.error(`[FAIL] ${f}`);
      console.error(err && err.stack ? err.stack : err);
      failures++;
    }
  }

  if (failures > 0) {
    const msg = `${failures} test(s) failed.`;
    console.error(msg);
    throw new Error(msg);
  }

  console.log("All unit tests passed.");
})().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
