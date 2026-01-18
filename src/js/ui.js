// UI wiring helpers for Keino Volume Calculator
// These functions expect DOM helpers `el`, `qs`, and utility functions like `safeDispatchChange`, `scheduleSave`, `calculateVolume`
// to be available globally (window.__keino_*) or they will attempt to use passed callbacks.

function getGlobal(name) {
  try {
    if (typeof window !== "undefined" && window.__keino && window.__keino[name])
      return window.__keino[name];
  } catch (e) {
    /* ignore */
  }
  return undefined;
}

function setupSizeIdInputs(opts = {}) {
  const calculateVolume = opts.calculateVolume || getGlobal("calculateVolume");
  const scheduleSave = opts.scheduleSave || getGlobal("scheduleSave");
  const pairs = [
    ["conductor_size", "conductor_size_id"],
    ["surface_size", "surface_size_id"],
    ["intermediate_size", "intermediate_size_id"],
    ["production_size", "production_size_id"],
    ["tieback_size", "tieback_size_id"],
    ["reservoir_size", "reservoir_size_id"],
    ["small_liner_size", "small_liner_size_id"],
    ["open_hole_size", "open_hole_size_id"],
    ["riser_type", "riser_type_id"],
  ];

  pairs.forEach(([selId, idInputId]) => {
    const sel = document.getElementById(selId);
    const idInput = document.getElementById(idInputId);
    if (!sel || !idInput) return;

    if (!idInput.value) idInput.value = sel.value;

    sel.addEventListener("change", () => {
      if (!idInput.dataset.userEdited) idInput.value = sel.value;
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    });

    idInput.addEventListener("input", () => {
      idInput.dataset.userEdited = "true";
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    });
  });
}

function setupCasingToggles(opts = {}) {
  const calculateVolume = opts.calculateVolume || getGlobal("calculateVolume");
  const scheduleSave = opts.scheduleSave || getGlobal("scheduleSave");

  document.querySelectorAll(".casing-input").forEach((section) => {
    const checkbox =
      section.querySelector(".use-checkbox") || section.querySelector("input[type=checkbox]");
    const header = section.querySelector(".casing-header");
    if (!checkbox || !header) return;

    const update = () => {
      if (checkbox.checked) {
        section.classList.remove("collapsed");
        header.setAttribute("aria-expanded", "true");
      } else {
        section.classList.add("collapsed");
        header.setAttribute("aria-expanded", "false");
      }
    };

    checkbox.addEventListener("change", () => {
      update();
      if (calculateVolume) calculateVolume();
      if (scheduleSave) scheduleSave();
    });

    header.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest(".header-inline") || target.tagName.toLowerCase() === "button") return;
      if (target.tagName.toLowerCase() === "h3") {
        checkbox.checked = !checkbox.checked;
        if (
          typeof window !== "undefined" &&
          typeof window.__keino_safeDispatchChange === "function"
        )
          window.__keino_safeDispatchChange(checkbox);
        else checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    header.tabIndex = 0;
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        if (
          typeof window !== "undefined" &&
          typeof window.__keino_safeDispatchChange === "function"
        )
          window.__keino_safeDispatchChange(checkbox);
        else checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    update();
  });
}

function setupButtons(opts = {}) {
  const calculateVolume = opts.calculateVolume || getGlobal("calculateVolume");
  const scheduleSave = opts.scheduleSave || getGlobal("scheduleSave");

  document.querySelectorAll(".wellhead-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      const well = document.getElementById("wellhead_depth");
      if (!input || !well) return;
      if (well.value === "") return;
      input.value = well.value;
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    })
  );

  // other button handlers (liner-default, reservoir-default, etc.) are similar; keep them lightweight
  document.querySelectorAll(".liner-default-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const target = document.getElementById("depth_7_top");
      if (!target) return;
      const inter = document.getElementById("depth_9")?.value;
      const well = document.getElementById("wellhead_depth")?.value;
      if (inter !== undefined && inter !== "") {
        const val = Number(inter);
        if (!isNaN(val)) target.value = String(val - 50);
      } else if (well !== undefined && well !== "") {
        target.value = well;
      }
      const tb = document.getElementById("depth_tb");
      if (tb) tb.value = target.value;
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    })
  );
}

function setupTooltips() {
  const setup = (btnId, tipId) => {
    const btn = document.getElementById(btnId);
    const tip = document.getElementById(tipId);
    if (!btn || !tip) return;
    btn.removeAttribute("title");
    let persistOpen = false;
    const show = () => {
      tip.classList.remove("hidden");
      tip.setAttribute("aria-hidden", "false");
    };
    const hide = () => {
      tip.classList.add("hidden");
      tip.setAttribute("aria-hidden", "true");
    };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", show);
    btn.addEventListener("mouseleave", () => {
      if (!persistOpen) hide();
    });
    btn.addEventListener("blur", hide);
    tip.addEventListener("mouseenter", show);
    tip.addEventListener("mouseleave", () => {
      if (!persistOpen) hide();
    });
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      persistOpen = true;
      show();
      btn.focus();
    });
    document.addEventListener("click", (e) => {
      if (!btn.contains(e.target) && !tip.contains(e.target)) {
        persistOpen = false;
        hide();
      }
    });
  };
  setup("production_liner_info_btn", "production_liner_info_tooltip");
  setup("reservoir_default_info_btn", "reservoir_default_info_tooltip");
}

function setupWellheadSync(opts = {}) {
  const calculateVolume = opts.calculateVolume || getGlobal("calculateVolume");
  const scheduleSave = opts.scheduleSave || getGlobal("scheduleSave");
  const well = document.getElementById("wellhead_depth");
  const riser = document.getElementById("depth_riser");
  if (!well || !riser) return;

  const wellheadContainer = document.getElementById("wellhead-depth-container");
  if (wellheadContainer) {
    wellheadContainer.classList.remove("hidden");
    wellheadContainer.setAttribute("aria-hidden", "false");
  }

  well.addEventListener("input", () => {
    if (riser.value !== well.value) {
      riser.value = well.value;
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    }
  });
  if (well.value !== "" && riser.value !== well.value) riser.value = well.value;

  const toggle = document.getElementById("riser_subsea");
  if (toggle)
    toggle.addEventListener("change", (e) => {
      if (e.target.checked && well.value !== "") {
        ["depth_18_top", "depth_13_top"].forEach((id) => {
          const v = document.getElementById(id);
          if (v) v.value = well.value;
        });
        if (scheduleSave) scheduleSave();
        if (calculateVolume) calculateVolume();
      }
    });
}

function setupTiebackBehavior(opts = {}) {
  const calculateVolume = opts.calculateVolume || getGlobal("calculateVolume");
  const scheduleSave = opts.scheduleSave || getGlobal("scheduleSave");
  const prodLinerChk = document.getElementById("production_is_liner");
  const tiebackCasing = document.getElementById("tieback_casing");
  const useTie = document.getElementById("use_tieback");
  const casingBtn = document.getElementById("production_casing_btn");
  if (!prodLinerChk || !tiebackCasing || !useTie) return;
  const prodInfoBtn = document.getElementById("production_liner_info_btn");

  document.addEventListener("change", (e) => {
    try {
      if (!e || !e.target || e.target.id !== "dummy_hanger") return;
      const dummyEl = document.getElementById("dummy_hanger");
      const tbTop = document.getElementById("depth_tb_top");
      const tb = document.getElementById("depth_tb");
      const wellEl = document.getElementById("wellhead_depth");
      const prodTopEl = document.getElementById("depth_7_top");
      if (!tbTop || !tb) return;
      tbTop.value = wellEl && wellEl.value ? wellEl.value : "";
      if (dummyEl && dummyEl.checked) {
        tb.removeAttribute("readonly");
        tb.classList.remove("readonly-input");
        tb.value = Number((Number((wellEl && wellEl.value) || 0) + 75).toFixed(1));
        delete tb.dataset.userEdited;
      } else {
        tb.setAttribute("readonly", "true");
        tb.readOnly = true;
        tb.classList.add("readonly-input");
        tb.value = prodTopEl && prodTopEl.value ? prodTopEl.value : "";
        delete tb.dataset.userEdited;
      }
      if (scheduleSave) scheduleSave();
      if (calculateVolume) calculateVolume();
    } catch (err) {
      /* ignore */
    }
  });

  const update = () => {
    if (prodLinerChk.checked) {
      tiebackCasing.classList.remove("hidden");
      tiebackCasing.setAttribute("aria-hidden", "false");
      useTie.checked = true;
      const tb = document.getElementById("depth_tb");
      if (tb) {
        tb.removeAttribute("readonly");
        tb.classList.remove("readonly-input");
        const wellVal = Number(document.getElementById("wellhead_depth")?.value || 0);
        if (!tb.dataset.userEdited) tb.value = Number((wellVal + 75).toFixed(1));
      }
      if (typeof window !== "undefined" && typeof window.__keino_safeDispatchChange === "function")
        window.__keino_safeDispatchChange(useTie);
      else
        try {
          useTie.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {}
      if (casingBtn) {
        casingBtn.classList.add("hidden");
        casingBtn.setAttribute("aria-hidden", "true");
      }
      if (prodInfoBtn) {
        prodInfoBtn.classList.add("hidden");
        prodInfoBtn.setAttribute("aria-hidden", "true");
      }
      const linerBtnEl = document.querySelectorAll(".liner-default-btn")[0];
      if (linerBtnEl) {
        linerBtnEl.click();
        const tb2 = document.getElementById("depth_tb");
        if (tb2 && !tb2.dataset.userEdited) {
          tb2.removeAttribute("readonly");
          tb2.classList.remove("readonly-input");
          const wellVal2 = Number(document.getElementById("wellhead_depth")?.value || 0);
          tb2.value = Number((wellVal2 + 75).toFixed(1));
        }
      }
    } else {
      tiebackCasing.classList.add("hidden");
      useTie.checked = false;
      if (casingBtn) {
        casingBtn.classList.remove("hidden");
        casingBtn.setAttribute("aria-hidden", "false");
      }
      if (prodInfoBtn) {
        prodInfoBtn.classList.remove("hidden");
        prodInfoBtn.setAttribute("aria-hidden", "false");
      }
    }
  };

  prodLinerChk.addEventListener("change", update);
  update();

  try {
    if (typeof window !== "undefined") {
      window.__TEST_updateDummy = () => {
        const dummyEl = document.getElementById("dummy_hanger");
        const tbTop = document.getElementById("depth_tb_top");
        const tb = document.getElementById("depth_tb");
        const wellEl = document.getElementById("wellhead_depth");
        const prodTopEl = document.getElementById("depth_7_top");
        if (!tbTop || !tb) return;
        tbTop.value = wellEl && wellEl.value ? wellEl.value : "";
        if (dummyEl && dummyEl.checked) {
          tb.removeAttribute("readonly");
          tb.classList.remove("readonly-input");
          tb.value = Number((Number((wellEl && wellEl.value) || 0) + 75).toFixed(1));
          delete tb.dataset.userEdited;
        } else {
          tb.setAttribute("readonly", "true");
          tb.readOnly = true;
          tb.classList.add("readonly-input");
          tb.value = prodTopEl && prodTopEl.value ? prodTopEl.value : "";
          delete tb.dataset.userEdited;
        }
      };
    }
  } catch (err) {
    /* ignore */
  }
}

module.exports = {
  setupSizeIdInputs,
  setupCasingToggles,
  setupButtons,
  setupTooltips,
  setupWellheadSync,
  setupTiebackBehavior,
};
