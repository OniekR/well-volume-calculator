import { describe, it, beforeEach, expect } from 'vitest';
import { renderResults } from '../render.js';

describe('POI Display', () => {
  beforeEach(() => {
    // Set up a basic HTML structure for testing (simplified, without grid wrappers)
    document.body.innerHTML = `
      <div id="totalVolume"><span>— m³</span></div>
      <div id="plugAboveVolume" class="hidden"><span class="label">Above:</span><span>— m³</span></div>
      <div id="plugBelowVolume" class="hidden"><span class="label">Below:</span><span>— m³</span></div>
      
      <!-- Tubing mode POI values -->
      <div id="plugAboveTubing" class="hidden"><span class="label">Vol above tubing:</span><span>— m³</span></div>
      <div id="plugAboveAnnulus" class="hidden"><span class="label">Vol above annulus:</span><span>— m³</span></div>
      <div id="plugAboveTubingOpenCasing" class="hidden"><span class="label">Casing between:</span><span>— m³</span></div>
      <div id="plugBelowTubing" class="hidden"><span class="label">Vol below tubing:</span><span>— m³</span></div>
      <div id="plugBelowAnnulus" class="hidden"><span class="label">Vol below annulus:</span><span>— m³</span></div>
      <div id="plugTotalBelowPOITubing" class="hidden"><span class="label">Total below POI:</span><span>— m³</span></div>
      
      <!-- Drill pipe mode POI values -->
      <div id="plugAboveDrillpipe" class="hidden"><span class="label">Vol above DP:</span><span>— m³</span></div>
      <div id="plugAboveDrillpipeAnnulus" class="hidden"><span class="label">Vol above annulus:</span><span>— m³</span></div>
      <div id="plugBelowDrillpipeCrossing" class="hidden"><span class="label">Vol below DP:</span><span>— m³</span></div>
      <div id="plugBelowDrillpipeAnnulusCrossing" class="hidden"><span class="label">Vol below annulus:</span><span>— m³</span></div>
      
      <div id="plugTotalBelowPOI" class="hidden"><span class="label">Total below:</span><span>— m³</span></div>
      <table id="casingVolumes"><tbody></tbody></table>
    `;
  });

  it('displays UC disabled volumes correctly', () => {
    const result = {
      totalVolume: 100.5,
      perCasingVolumes: [],
      casingsToDraw: [],
      plugAboveVolume: 40.2,
      plugBelowVolume: 60.3,
      plugAboveTubing: 0,
      plugBelowTubing: 0,
      plugAboveAnnulus: 0,
      plugBelowAnnulus: 0,
      plugAboveTubingOpenCasing: 0,
      plugAboveDrillpipe: 0,
      plugBelowDrillpipe: 0,
      plugAboveDrillpipeAnnulus: 0,
      plugBelowDrillpipeAnnulus: 0,
      plugAboveDrillpipeOpenCasing: 0,
      plugBelowDrillpipeOpenCasing: 0,
      ucActive: false,
      dpMode: false,
      dpTotalDepth: 0,
      plugDepthVal: 0
    };

    renderResults(result, { ucEnabled: false, dpMode: false });

    expect(document.getElementById('plugAboveVolume').textContent).toContain(
      '40.20'
    );
    expect(document.getElementById('plugBelowVolume').textContent).toContain(
      '60.30'
    );
    expect(
      document.getElementById('plugAboveTubing').classList.contains('hidden')
    ).toBe(true);
    expect(
      document.getElementById('plugAboveDrillpipe').classList.contains('hidden')
    ).toBe(true);
  });

  it('displays tubing mode (above POI) correctly', () => {
    const result = {
      totalVolume: 100.5,
      perCasingVolumes: [],
      casingsToDraw: [],
      plugAboveVolume: 0,
      plugBelowVolume: 0,
      plugAboveTubing: 15.5,
      plugBelowTubing: 0,
      plugAboveAnnulus: 24.8,
      plugBelowAnnulus: 0,
      plugAboveTubingOpenCasing: 10.2,
      plugAboveDrillpipe: 0,
      plugBelowDrillpipe: 0,
      plugAboveDrillpipeAnnulus: 0,
      plugBelowDrillpipeAnnulus: 0,
      plugAboveDrillpipeOpenCasing: 0,
      plugBelowDrillpipeOpenCasing: 0,
      ucActive: true,
      dpMode: false,
      dpTotalDepth: 0,
      plugDepthVal: 1000
    };

    renderResults(result, {
      ucEnabled: true,
      dpMode: false,
      ucBottom: 500,
      plugAboveTubingOpenCasing: 10.2
    });

    // Check that tubing elements are shown
    expect(
      document.getElementById('plugAboveTubing').classList.contains('hidden')
    ).toBe(false);
    expect(document.getElementById('plugAboveTubing').textContent).toContain(
      '15.50'
    );
    expect(document.getElementById('plugAboveAnnulus').textContent).toContain(
      '24.80'
    );
    expect(
      document.getElementById('plugAboveTubingOpenCasing').textContent
    ).toContain('10.20');
  });

  it('displays tubing mode (crossing POI) correctly', () => {
    const result = {
      totalVolume: 100.5,
      perCasingVolumes: [],
      casingsToDraw: [],
      plugAboveVolume: 0,
      // Total below should include tubing + annulus + remaining casing below tubing shoe
      plugBelowVolume: 20.8,
      plugBelowVolumeTubing: 20.8,
      plugAboveTubing: 15.5,
      plugBelowTubing: 8.3,
      plugAboveAnnulus: 24.8,
      plugBelowAnnulus: 12.5,
      plugAboveTubingOpenCasing: 0,
      plugBelowTubingOpenCasing: 0,
      casingVolumeBelowTubingShoe: 0,
      plugAboveDrillpipe: 0,
      plugBelowDrillpipe: 0,
      plugAboveDrillpipeAnnulus: 0,
      plugBelowDrillpipeAnnulus: 0,
      plugAboveDrillpipeOpenCasing: 0,
      plugBelowDrillpipeOpenCasing: 0,
      ucActive: true,
      dpMode: false,
      dpTotalDepth: 0,
      plugDepthVal: 500
    };

    // Tubing crosses POI when ucBottom > plugDepthVal
    renderResults(result, {
      ucEnabled: true,
      dpMode: false,
      ucBottom: 800,
      plugAboveTubingOpenCasing: 0
    });

    expect(
      document.getElementById('plugBelowTubing').classList.contains('hidden')
    ).toBe(false);
    expect(document.getElementById('plugBelowTubing').textContent).toContain(
      '8.30'
    );
    expect(document.getElementById('plugBelowAnnulus').textContent).toContain(
      '12.50'
    );

    // Total should be casing volume below tubing shoe = 0 in this test scenario
    expect(
      document.getElementById('plugTotalBelowPOITubing').textContent
    ).toContain('0.00');
  });

  it('displays drill pipe mode correctly', () => {
    const result = {
      totalVolume: 100.5,
      perCasingVolumes: [],
      casingsToDraw: [],
      plugAboveVolume: 0,
      plugBelowVolume: 0,
      plugAboveTubing: 0,
      plugBelowTubing: 0,
      plugAboveAnnulus: 0,
      plugBelowAnnulus: 0,
      plugAboveTubingOpenCasing: 0,
      plugBelowTubingOpenCasing: 0,
      casingVolumeBelowTubingShoe: 0,
      plugAboveDrillpipe: 20.1,
      plugBelowDrillpipe: 15.3,
      plugAboveDrillpipeAnnulus: 35.4,
      plugBelowDrillpipeAnnulus: 18.9,
      plugAboveDrillpipeOpenCasing: 0,
      plugBelowDrillpipeOpenCasing: 0,
      ucActive: true,
      dpMode: true,
      dpTotalDepth: 600,
      plugDepthVal: 500
    };

    renderResults(result, { ucEnabled: true, dpMode: true, ucBottom: 100 });

    expect(
      document.getElementById('plugAboveDrillpipe').classList.contains('hidden')
    ).toBe(false);
    expect(
      document
        .getElementById('plugBelowDrillpipeCrossing')
        .classList.contains('hidden')
    ).toBe(false);
    expect(document.getElementById('plugAboveDrillpipe').textContent).toContain(
      '20.10'
    );
    expect(
      document.getElementById('plugAboveDrillpipeAnnulus').textContent
    ).toContain('35.40');
  });
});
