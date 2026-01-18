const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  const root = path.resolve(__dirname, "..", "..", "..");
  const indexPath =
    "file://" + path.join(root, "index.html").replace(/\\/g, "/");
  const presetsPath = path.join(root, "public", "well-presets.json");
  let p9State = null;
  try {
    const content = JSON.parse(fs.readFileSync(presetsPath, "utf8"));
    const payload = content.presets || content;
    if (payload && payload["P-9"] && payload["P-9"].state)
      p9State = payload["P-9"].state;
    else if (payload && payload["P-9"]) p9State = payload["P-9"];
  } catch (err) {
    console.error(
      "Could not read well-presets.json:",
      err && err.message ? err.message : err,
    );
    process.exit(2);
  }
  if (!p9State) {
    console.error("P-9 not found in well-presets.json");
    process.exit(3);
  }

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  try {
    await page.goto(indexPath, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    // wait for preset_list to exist (using waitForFunction for broad compatibility)
    await page.waitForFunction(() => !!document.getElementById("preset_list"), {
      timeout: 5000,
    });

    // seed localStorage with P-9 under the expected key
    const PRESETS_KEY = "well_presets_v1";
    await page.evaluate(
      (key, state) => {
        const obj = {};
        obj["P-9"] = { savedAt: Date.now(), state };
        localStorage.setItem(key, JSON.stringify(obj));
      },
      PRESETS_KEY,
      p9State,
    );

    // populate select with P-9 option
    await page.evaluate(() => {
      const sel = document.getElementById("preset_list");
      sel.innerHTML = '<option value="">— Select a preset —</option>';
      const opt = document.createElement("option");
      opt.value = "P-9";
      opt.textContent = "P-9";
      sel.appendChild(opt);
    });

    // Debug: check that module can read the preset from localStorage / builtin loader
    const preLoadState = await page.evaluate(() => {
      return {
        localStorageRaw: localStorage.getItem("well_presets_v1"),
        moduleGet:
          window.__KeinoPresets &&
          typeof window.__KeinoPresets.getPresetState === "function"
            ? window.__KeinoPresets.getPresetState("P-9")
            : null,
      };
    });
    console.log("preLoadState:", preLoadState);

    // Click Load
    await page.select("#preset_list", "P-9");
    await page.click("#load_preset_btn");

    // Debug: capture immediate state and after short delays to detect overwrites
    const snap1 = await page.evaluate(() => ({
      use_small_liner: !!document.getElementById("use_small_liner")?.checked,
      depth_small: document.getElementById("depth_small")?.value || "",
      depth_small_top: document.getElementById("depth_small_top")?.value || "",
      depth_5: document.getElementById("depth_5")?.value || "",
      depth_7_top: document.getElementById("depth_7_top")?.value || "",
      production_is_liner: !!document.getElementById("production_is_liner")
        ?.checked,
      production_casing_active:
        document
          .getElementById("production_casing_btn")
          ?.classList.contains("active") || false,
      production_liner_active:
        document
          .querySelector(".liner-default-btn")
          ?.classList.contains("active") || false,
      small_liner_expanded: (() => {
        const el = document.getElementById("use_small_liner");
        const section = el ? el.closest(".casing-input") : null;
        return section ? !section.classList.contains("collapsed") : false;
      })(),
    }));

    await new Promise((r) => setTimeout(r, 100));
    const snap2 = await page.evaluate(() => ({
      use_small_liner: !!document.getElementById("use_small_liner")?.checked,
      depth_small: document.getElementById("depth_small")?.value || "",
      depth_small_top: document.getElementById("depth_small_top")?.value || "",
      depth_5: document.getElementById("depth_5")?.value || "",
      depth_7_top: document.getElementById("depth_7_top")?.value || "",
      production_is_liner: !!document.getElementById("production_is_liner")
        ?.checked,
      production_casing_active:
        document
          .getElementById("production_casing_btn")
          ?.classList.contains("active") || false,
      production_liner_active:
        document
          .querySelector(".liner-default-btn")
          ?.classList.contains("active") || false,
      small_liner_expanded: (() => {
        const el = document.getElementById("use_small_liner");
        const section = el ? el.closest(".casing-input") : null;
        return section ? !section.classList.contains("collapsed") : false;
      })(),
    }));

    await new Promise((r) => setTimeout(r, 200));
    const snap3 = await page.evaluate(() => ({
      use_small_liner: !!document.getElementById("use_small_liner")?.checked,
      depth_small: document.getElementById("depth_small")?.value || "",
      depth_small_top: document.getElementById("depth_small_top")?.value || "",
      depth_5: document.getElementById("depth_5")?.value || "",
      depth_7_top: document.getElementById("depth_7_top")?.value || "",
      production_is_liner: !!document.getElementById("production_is_liner")
        ?.checked,
      production_casing_active:
        document
          .getElementById("production_casing_btn")
          ?.classList.contains("active") || false,
      production_liner_active:
        document
          .querySelector(".liner-default-btn")
          ?.classList.contains("active") || false,
      small_liner_expanded: (() => {
        const el = document.getElementById("use_small_liner");
        const section = el ? el.closest(".casing-input") : null;
        return section ? !section.classList.contains("collapsed") : false;
      })(),
    }));

    console.log("SNAP1", snap1);
    console.log("SNAP2", snap2);
    console.log("SNAP3", snap3);

    // Use snap3 as final state for assertions
    const finalResult = snap3;
    // short delay to allow UI handlers to run
    await new Promise((r) => setTimeout(r, 300));

    console.log("SNAP1", snap1);
    console.log("SNAP2", snap2);
    console.log("SNAP3", snap3);
    console.log("Final small liner state:", finalResult);

    if (
      finalResult.use_small_liner === true &&
      finalResult.depth_small === "4992" &&
      finalResult.small_liner_expanded === true
    ) {
      console.log("PASS: Small Liner expanded and seeded correctly for P-9");
    } else {
      console.error("FAIL: Small Liner not as expected", finalResult);
      // Try applying the state manually to see if the DOM reacts correctly (diagnostic)
      await page.evaluate((stateObj) => {
        Object.entries(stateObj).forEach(([id, item]) => {
          const input = document.getElementById(id);
          if (!input) return;
          if (item.type === "checkbox") input.checked = !!item.value;
          else input.value = item.value;
        });
        Array.from(document.querySelectorAll(".use-checkbox")).forEach((cb) =>
          cb.dispatchEvent(new Event("change", { bubbles: true })),
        );
      }, p9State);
      await new Promise((r) => setTimeout(r, 200));
      const manualResult = await page.evaluate(() => ({
        depth_small: document.getElementById("depth_small")?.value || "",
        depth_7_top: document.getElementById("depth_7_top")?.value || "",
        production_casing_active:
          document
            .getElementById("production_casing_btn")
            ?.classList.contains("active") || false,
        production_liner_active:
          document
            .querySelector(".liner-default-btn")
            ?.classList.contains("active") || false,
      }));
      console.log("After manual apply:", manualResult);
    }

    // Also check Production Liner/Casing active state: prefer Casing for P-9
    if (
      finalResult.production_casing_active &&
      !finalResult.production_liner_active
    ) {
      console.log("PASS: Production shows Casing active");
      await browser.close();
      process.exit(0);
    } else {
      console.error(
        "FAIL: Production toggle state incorrect",
        finalResult.production_casing_active,
        finalResult.production_liner_active,
      );
      await browser.close();
      process.exit(6);
    }
  } catch (err) {
    console.error(
      "ERROR running smoke test",
      err && err.message ? err.message : err,
    );
    await browser.close();
    process.exit(5);
  }
})();
