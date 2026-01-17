const fs = require("fs");
const path = require("path");

const testDir = path.join(__dirname);
const files = fs
  .readdirSync(testDir)
  .filter((f) => f.endsWith(".spec.js") || f.endsWith(".test.js"));

if (!files.length) {
  console.log("No unit tests found.");
  process.exit(0);
}

let failures = 0;
files.forEach((f) => {
  console.log(`Running ${f}...`);
  try {
    require(path.join(testDir, f));
    console.log(`[PASS] ${f}`);
  } catch (err) {
    console.error(`[FAIL] ${f}`);
    console.error(err && err.stack ? err.stack : err);
    failures++;
  }
});

if (failures > 0) {
  console.error(`${failures} test(s) failed.`);
  process.exit(1);
}

console.log("All unit tests passed.");