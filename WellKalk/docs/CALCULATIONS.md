# Calculation Notes

This document summarizes the formulas used in the calculators.

## Constants
- INCH_TO_M = 0.0254 m
- 1 bar = 1e5 Pa

## Volume (cylinder)
Volume of a cylinder (section) in cubic meters:

V = π * (r²) * L

where r = diameter_in * INCH_TO_M / 2, and L is length in meters.

Implemented in `calculateCylinderVolume(diameterIn, lengthM)`.

## Cement strokes
Strokes to bump:

strokes = cementVolumeM3 / strokeVolumeM3

(returns 0 if strokeVolumeM3 ≤ 0)

## Pressure test liters
Convert pressurization required using a simple compressibility factor k:

Liters = ((volumeM3 * deltaPressureBar) / kFactor) * 1000

## Annular velocity
Annular flow area (m²): A = π*(D_o²/4) - π*(D_i²/4)

Annular velocity (m/s) = Q (m³/s) / A

where Q is converted from L/min to m³/s: Q = LPM / 1000 / 60

## String lift
Lift force (N) from differential pressure:

Force = (π*(D_casing² - D_pipe²)/4) * pressure_Pa

where D_casing and D_pipe are inner diameters in meters and pressure_Pa = pressureBar * 1e5.

