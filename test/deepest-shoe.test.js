const assert = require("assert");

// Pure helper under test
function getDeepestShoe(vals) {
  if (!Array.isArray(vals) || vals.length === 0) return undefined;
  const nums = vals.filter((v) => typeof v === "number" && !isNaN(v));
  if (nums.length === 0) return undefined;
  return Math.max(...nums);
}

// Tests
assert.strictEqual(getDeepestShoe([100, 200, 50]), 200);
assert.strictEqual(getDeepestShoe([]), undefined);
assert.strictEqual(getDeepestShoe(["", null, undefined]), undefined);
assert.strictEqual(getDeepestShoe([0, -10, 5]), 5);

console.log("deepest-shoe tests OK");