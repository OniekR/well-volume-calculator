const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

(async () => {
  const htmlPath = path.resolve(__dirname, '..', '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: `file://${htmlPath.replace(/\\/g, '/')}` });
  const { window } = dom;

  await new Promise((resolve) => {
    if (window.document.readyState === 'complete') return resolve();
    window.addEventListener('load', () => setTimeout(resolve, 50));
  });

  const d = window.document;
  const results = [];

  function pass(name) { console.log('PASS:', name); results.push({name, ok: true}); }
  function fail(name, err) { console.error('FAIL:', name, err); results.push({name, ok: false, err: err && err.stack ? err.stack : String(err)}); }

  try {
    // Check size-id inputs initialized to select values
    const conductorSel = d.getElementById('conductor_size');
    const conductorId = d.getElementById('conductor_size_id');
    if (!conductorSel || !conductorId) throw new Error('Missing conductor controls');
    if (conductorId.value == '' || conductorId.value == undefined) {
      // script should set initial value on setup; give it a tick
      await new Promise(r => setTimeout(r, 20));
    }
    if (conductorId.value === conductorSel.value) pass('conductor size-id initialized'); else fail('conductor size-id initialized', `expected ${conductorSel.value} got ${conductorId.value}`);

    // Toggle conductor use off -> should not appear in table
    const useConductor = d.getElementById('use_18');
    useConductor.checked = false;
    useConductor.dispatchEvent(new window.Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 30));
    const rows = Array.from(d.querySelectorAll('#casingVolumes tbody tr'));
    const hasConductor = rows.some(tr => tr.children[0] && tr.children[0].textContent.trim() === 'Conductor');
    if (!hasConductor) pass('conductor hidden when unchecked'); else fail('conductor hidden when unchecked', 'Conductor row still present');

    // Set some depths and check totalVolume updates
    d.getElementById('depth_13').value = '1000';
    d.getElementById('depth_9').value = '2000';
    d.getElementById('depth_7').value = '1500';
    d.getElementById('depth_18_bottom').value = '600';
    d.getElementById('depth_5').value = '2200';
    // trigger input events
    ['depth_13','depth_9','depth_7','depth_18_bottom','depth_5'].forEach(id => d.getElementById(id).dispatchEvent(new window.Event('input', { bubbles: true })));
    await new Promise(r => setTimeout(r, 50));
    const totalText = d.getElementById('totalVolume').textContent;
    if (totalText && totalText !== '0.00 m³') pass('totalVolume non-zero after setting depths'); else fail('totalVolume non-zero after setting depths', `got ${totalText}`);

    // Change production size id and ensure no error and value updates
    const prodId = d.getElementById('production_size_id');
    prodId.value = '6.276';
    prodId.dispatchEvent(new window.Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    pass('production size-id input accepted');

    // Toggle production_is_liner -> tieback section should become visible and use_tieback checked
    const prodLiner = d.getElementById('production_is_liner');
    prodLiner.checked = true; prodLiner.dispatchEvent(new window.Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    const tiebackCasing = d.getElementById('tieback_casing');
    const useTie = d.getElementById('use_tieback');
    if (tiebackCasing && !tiebackCasing.classList.contains('hidden') && useTie && useTie.checked) pass('tieback shown and checked when production_is_liner set'); else fail('tieback shown and checked when production_is_liner set', `tieback.hidden=${!!tiebackCasing.classList.contains('hidden')}, useTie=${useTie && useTie.checked}`);

    // Ensure changing select updates id input unless user-edited
    const surfaceSel = d.getElementById('surface_size');
    const surfaceId = d.getElementById('surface_size_id');
    surfaceSel.value = surfaceSel.querySelector('option:last-of-type').value; surfaceSel.dispatchEvent(new window.Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 25));
    if (surfaceId.value === surfaceSel.value) pass('surface id input follows select when not user-edited'); else fail('surface id input follows select', `expected ${surfaceSel.value} got ${surfaceId.value}`);

    // Overlap allocation: the casing with the smallest numeric ID should win overlapping segments
    // Make Production and Reservoir fully overlap (0 - 500) and ensure the smaller ID (Reservoir) gets the volume
    d.getElementById('depth_7_top').value = '0';
    d.getElementById('depth_7').value = '500';
    d.getElementById('depth_5_top').value = '0';
    d.getElementById('depth_5').value = '500';
    // ensure ID inputs are set explicitly (reservoir smaller than production)
    d.getElementById('production_size_id').value = '8.535';
    d.getElementById('reservoir_size_id').value = '6.184';
    // ensure both are enabled
    d.getElementById('use_7').checked = true; d.getElementById('use_5').checked = true;
    ['depth_7_top','depth_7','depth_5_top','depth_5','production_size_id','reservoir_size_id','use_7','use_5'].forEach(id => { const el = d.getElementById(id); if (el) el.dispatchEvent(new window.Event('input', { bubbles: true })); });
    await new Promise(r => setTimeout(r, 50));

    const rowsAfter = Array.from(d.querySelectorAll('#casingVolumes tbody tr'));
    const mapping = {};
    rowsAfter.forEach((tr) => { const name = tr.children[0] && tr.children[0].textContent && tr.children[0].textContent.trim(); const vol = tr.children[1] && parseFloat(tr.children[1].textContent) || 0; if (name) mapping[name] = vol; });
    if ((mapping['Reservoir'] || 0) > 0 && (mapping['Production'] || 0) === 0) pass('overlap: smaller ID wins entire overlapping span'); else fail('overlap: smaller ID wins', `reservoir=${mapping['Reservoir']}, production=${mapping['Production']}`);

  } catch (err) {
    fail('smoke tests', err);
  }

  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.error('\nSome smoke tests failed:', failed);
    process.exit(2);
  }
  console.log('\nAll smoke tests passed.');
  process.exit(0);
})();
