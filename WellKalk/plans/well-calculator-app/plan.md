# Well Calculator Application

**Branch:** `feature/well-calculator-app`
**Description:** Build a responsive React TypeScript web application with well builder and multiple drilling calculators

## Goal

Create a professional well engineering application that allows users to build well schematics visually and perform common drilling calculations. The app will feature a responsive navigation system, dark mode support, real-time well visualization, and multiple calculator modules that leverage shared well data for accurate engineering calculations.

## Implementation Steps

### Step 1: Project Initialization & Configuration

**Files:**

- package.json
- vite.config.ts
- tsconfig.json
- tsconfig.node.json
- tailwind.config.js
- postcss.config.js
- index.html
- src/main.tsx
- src/App.tsx
- src/vite-env.d.ts
- .gitignore

**What:** Initialize a new Vite + React + TypeScript project with Tailwind CSS configuration. Set up the build system, development environment, and custom Equinor color scheme in Tailwind config. Configure TypeScript for strict type checking and create the basic app entry points.

**Testing:** Run `npm run dev` to verify the development server starts successfully, hot reload works, and Tailwind CSS classes are being applied correctly.

---

### Step 2: Type Definitions & Data Models

**Files:**

- src/types/well.types.ts
- src/types/calculator.types.ts
- src/types/common.types.ts

**What:** Define comprehensive TypeScript interfaces and types for well sections, calculator inputs/outputs, navigation, and shared UI components.

**Testing:** Verify TypeScript compilation succeeds and types are properly exported/imported across files.

---

### Step 3: Core Layout & Responsive Navigation

**Files:**

- src/components/layout/Layout.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/MobileNav.tsx
- src/components/layout/Header.tsx
- src/components/ui/ThemeToggle.tsx
- src/styles/globals.css
- src/styles/variables.css

**What:** Create the main application layout with responsive navigation. Implement a left sidebar for desktop with collapsible menu items, and a bottom navigation bar for mobile devices with appropriate icons. Add a header with app branding and dark mode toggle.

**Testing:** Test responsive behavior by resizing the browser window. Verify navigation works on mobile viewport (<768px), tablet (768px-1024px), and desktop (>1024px). Test dark mode toggle functionality.

---

### Step 4: Routing & Page Structure

**Files:**

- src/App.tsx (update)
- src/pages/Home.tsx
- src/pages/WellBuilderPage.tsx
- src/pages/calculators/WellVolumeCalculator.tsx
- src/pages/calculators/CementCalculator.tsx
- src/pages/calculators/PressureTestCalculator.tsx
- src/pages/calculators/FluidFlowCalculator.tsx
- src/pages/calculators/StringLiftCalculator.tsx

**What:** Set up React Router v6 with routes for home page, well builder, and all five calculator pages. Create page components with basic layouts and placeholder content. Configure nested routes for calculator pages under a `/calculators` prefix.

**Testing:** Verify all routes are accessible via URL navigation and clicking navigation links. Confirm browser back/forward buttons work correctly.

---

### Step 5: Shared UI Components

**Files:**

- src/components/ui/Button.tsx
- src/components/ui/Card.tsx
- src/components/ui/Input.tsx
- src/components/ui/Select.tsx
- src/components/ui/Label.tsx
- src/components/ui/Badge.tsx

**What:** Create reusable, styled UI components that follow the Equinor design system with the provided color scheme. Implement Button with variants (primary, secondary, danger), Card for sectioning content, Input with validation states, Select for dropdowns, Label for form fields, and Badge for status indicators. All components should be fully typed and support dark mode.

**Testing:** Create a test page that renders all UI components in different states and variants. Verify proper styling, hover states, focus states, and dark mode appearance.

---

### Step 6: Well Data Context & State Management

**Files:**

- src/context/WellContext.tsx
- src/hooks/useWellData.ts
- src/hooks/useLocalStorage.ts

**What:** Implement React Context for managing global well data state. Create custom hooks for accessing and updating well sections, calculating derived values (total depth, annular volumes), and persisting data to localStorage. This allows calculators to access well builder data seamlessly.

**Testing:** Build the well in the builder, navigate to a calculator, and verify well data is accessible. Refresh the page and confirm data persists from localStorage.

---

### Step 7: Well Builder Core Functionality

**Files:**

- src/pages/WellBuilderPage.tsx (update)
- src/components/well-builder/WellSectionForm.tsx
- src/components/well-builder/SectionList.tsx
- src/components/well-builder/SectionCard.tsx
- src/utils/wellValidation.ts

**What:** Implement the well builder interface with forms to add/edit/delete well sections. Include section type selection, depth inputs (MD/TVD), diameter fields, and optional fields like weight and grade.

**Testing:** Add multiple well sections with different parameters, edit existing sections, delete sections, and verify validation errors appear for invalid inputs (overlapping depths, increasing diameter with depth).

---

### Step 8: Well Visualization Component

**Files:**

- src/components/well-builder/WellVisualization.tsx
- src/components/well-builder/WellCanvas.tsx
- src/utils/wellGeometry.ts

**What:** Create an SVG-based well schematic visualization that displays on the right side of the well builder page. Show all casing strings, tubing, liners, and open hole sections with proportional diameters and accurate depths. Use the --uc-tubing-green color for tubing and gray shades for casings. Add depth markers, section labels, and interactive hover tooltips showing section details. Include zoom and pan controls for deep wells.

**Testing:** Build a well with 3-4 sections of varying diameters and depths. Verify the visualization accurately represents the well geometry, sections are color-coded correctly, depths are labeled, and tooltips show correct information on hover.

---

### Step 9: Well Volume Calculator

**Files:**

- src/pages/calculators/WellVolumeCalculator.tsx (update)
- src/utils/volumeCalculations.ts
- src/components/calculators/shared/CalculatorLayout.tsx
- src/components/calculators/shared/ResultCard.tsx

**What:** Implement the well volume calculator with inputs for well geometry. Calculate and display volumes in multiple units with the ability to toggle between metric and imperial.

**Testing:** Enter well parameters and verify volume calculations are accurate. Compare with manual calculations using standard formulas. Test with well builder data if integration is implemented.

---

### Step 10: Well Cement Calculator

**Files:**

- src/pages/calculators/CementCalculator.tsx (update)
- src/utils/cementCalculations.ts

**What:** Build a cement calculator for planning cementing operations. Include inputs for interval to cement, casing/hole sizes, slurry properties, and excess percentage.

**Testing:** Calculate cement requirements for a typical casing string. Verify slurry volume, dry cement weight, and mix water calculations. Test with different slurry densities and excess percentages.

---

### Step 11: Pressure Test Calculator

**Files:**

- src/pages/calculators/PressureTestCalculator.tsx (update)
- src/utils/pressureCalculations.ts

**What:** Create a pressure test calculator for casing integrity tests. Display results with safety margins and pass/fail indicators.

**Testing:** Input test parameters and verify pressure calculations match industry standards. Test calculation of equivalent mud weight from test pressure at various depths.

---

### Step 12: Fluid Flow Calculator

**Files:**

- src/pages/calculators/FluidFlowCalculator.tsx (update)
- src/utils/flowCalculations.ts
- src/utils/unitConversions.ts

**What:** Implement a fluid flow calculator that converts flow rates to annular velocity. Include inputs for flow rate, outer diameter (casing/hole), and inner diameter (drill pipe/tubing).

**Testing:** Convert 1000 L/min to m/s for a specific annular geometry and verify calculation accuracy. Test with various annular sizes and flow rates. Confirm unit conversions are correct.

---

### Step 13: String Lift Calculator

**Files:**

- src/pages/calculators/StringLiftCalculator.tsx (update)
- src/utils/liftCalculations.ts

**What:** Build a calculator for string lift forces generated from pressure. Display results with warnings if calculated forces exceed string ratings.

**Testing:** Calculate lift force for a known pressure and string diameter. Verify force calculation against hand calculations. Test with different pressure units and string sizes.

---

### Step 14: Calculator Data Integration

**Files:**

- src/hooks/useCalculatorData.ts
- All calculator pages (updates)

**What:** Integrate calculators with well builder data. Add "Use Well Data" buttons to auto-populate calculator inputs from the active well in context. Implement logic to extract relevant geometry (depths, diameters, capacities) for each calculator type. Allow users to override auto-populated values for "what-if" scenarios.

**Testing:** Build a complete well, navigate to each calculator, click "Use Well Data", and verify correct values are populated. Modify auto-populated values and confirm calculations update correctly.

---

### Step 15: Export & Data Persistence

**Files:**

- src/components/well-builder/ExportMenu.tsx
- src/utils/exportHelpers.ts
- src/hooks/useLocalStorage.ts (update)

**What:** Add export functionality to save well data and calculator results. Implement import functionality to load previously saved wells. Ensure all well data auto-saves to localStorage on changes.

**Testing:** Export a well to all supported formats and verify data integrity. Import an exported well and confirm all sections are restored correctly. Clear localStorage and verify data persistence warning appears.

---

### Step 16: Form Validation & Error Handling

**Files:**

- src/utils/validation.ts
- src/components/ui/ErrorMessage.tsx
- src/components/ui/Toast.tsx
- All form components (updates)

**What:** Implement comprehensive validation for all inputs in well builder and calculators. Add real-time validation with clear error messages for invalid values (negative numbers, depth conflicts, unrealistic values). Create toast notifications for success/error states. Add error boundaries to catch and gracefully handle runtime errors.

**Testing:** Attempt to enter invalid data in all forms and verify appropriate error messages appear. Test edge cases like zero values, very large numbers, and non-numeric inputs. Verify error boundaries catch component errors.

---

### Step 17: Responsive Design & Mobile Optimization

**Files:**

- All component files (CSS/styling updates)
- src/styles/responsive.css

**What:** Refine responsive behavior across all components for mobile, tablet, and desktop viewports. Optimize the well visualization for small screens (scrollable, touch-friendly). Ensure calculator inputs and results are easily readable on mobile. Test touch interactions, form inputs on mobile keyboards, and navigation gestures.

**Testing:** Test the entire application on physical mobile devices (iOS and Android) and various screen sizes using browser dev tools. Verify all interactive elements are touch-friendly (minimum 44×44px), text is readable without zooming, and navigation is intuitive on mobile.

---

### Step 18: Dark Mode Implementation

**Files:**

- src/context/ThemeContext.tsx
- src/hooks/useTheme.ts
- tailwind.config.js (update)
- src/styles/variables.css (update)
- All component files (theme class updates)

**What:** Implement full dark mode support with theme persistence to localStorage. Define dark mode color variants for the Equinor color scheme. Add smooth transitions when toggling themes.

**Testing:** Toggle dark mode on every page and component. Verify all text remains readable, sufficient contrast ratios (WCAG AA minimum 4.5:1), and theme preference persists after page reload.

---

### Step 19: Performance Optimization

**Files:**

- All component files (React.memo, useMemo, useCallback additions)
- src/utils/lazyLoad.ts
- vite.config.ts (update)

**What:** Optimize application performance by implementing code splitting with React.lazy for calculator pages, memoizing expensive calculations and visualizations, and debouncing real-time calculation updates. Configure Vite for optimal production builds with tree-shaking and minification. Add loading states for lazy-loaded components.

**Testing:** Run Lighthouse performance audit and achieve scores >90. Verify lazy loading works with network throttling. Test that rapid input changes don't cause calculation lag or re-render issues.

---

### Step 20: Documentation & Polish

**Files:**

- README.md
- docs/USER_GUIDE.md
- docs/CALCULATIONS.md
- src/pages/Home.tsx (update with getting started guide)

**What:** Create comprehensive documentation including setup instructions, feature overview, calculation methodologies with formulas, and user guide. Update the home page with clear navigation guidance and quick start tutorial. Add helpful tooltips and info icons throughout the application explaining engineering concepts.

**Testing:** Follow the README setup instructions from scratch on a clean machine. Verify all documentation is accurate and links work. Have a non-technical user attempt to use the application with only the documentation.

---

## Clarifying Questions

Before proceeding with implementation, please provide clarity on:

### Well Builder Specifics:

1. **Section Types**: What well component types should be supported (e.g., Conductor, Surface Casing, Intermediate Casing, Production Casing, Liner, Tubing, Open Hole)?
   Answer:
   There should be 8 sections for casing types (more inputs for each section will be input at a later stage) The given values in paranthesis are out diameters of the casings:

- Riser (possible inputs are Drilling riser, Production riser, Marine riser, and No riser.)
- Conductor (typically 30 inches)
- Surface casing (typically 18 5/8 inch or 20 inch)
- Intermediate casing (typically 13 3/8" or 13 5/8")
- Production casing / liner (typically 9 5/8")
  - Production casing should have a 2 quick select buttons, 1 named 'Casing' and 1 named 'Liner'. The 'Casing' button should set the 'Top MD' to wellhead depth (or Conductor depth). The 'Liner' button should set the 'Top MD' to 50 m above Intermediate casing's 'Shoe MD'.
- Reservoir liner (typically 7")
  - Reservoir liner should have a quick select buttons, named 'Liner'. The 'Liner' button should set the 'Top MD' to 50 m above Production casing's 'Shoe MD'.
- Small liner (typically 4 1/2")
  - Small liner should have a quick select buttons, named 'Liner'. The 'Liner' button should set the 'Top MD' to 50 m above Reservoir liner's 'Shoe MD'.
- Open hole section (this should have possible inputs as 17 1/2", 16", 12 1/4", 8 1/2" or 6") If this is used, it should always link up to the deepest casing used above

2. **Required Fields**: For each section, what fields are mandatory (e.g., Top MD, Shoe MD, TVD, Outer Diameter, Inner Diameter/Drift, Weight per foot, Grade, Top of Cement)?
   Answer:

- The mandatory fields will be 'Top MD', 'Shoe MD', 'Out Diameter' (should be selected from a dropdown menu),
- 'Inner Diameter' and 'Drift' should be picked from hard coded data that's in the website.
- 'Weight per foot' and 'Grade' will be a values in the hard coded data with each casing.
- The deeper the casing should always fit inside the shallower casing's drift ID (if provided). If it does not fit, a small warning sign should appear.

3. **Validation Rules**: Should the system enforce rules like "diameters must decrease with depth" or "sections cannot overlap"?
   Answer:

- Sections can overlap (and should show so on the illustration that's visible on the right side), but if sections (casings specifically) only the inner diameter will be used for well volume calculations.

4. **Water Depth**: Should offshore wells be supported with separate air gap and water depth inputs?
   Answer:

- The focus should be mainly on offshore wells. The standard input for air gap can be 30 m and water depth can be 300 m with option for the user to change this as they wish.
- It should also be possible for the user to instead of inputting air gap and water depth just to use riser depth, and the illustration should reflect some estimate for air gap and water gap - about 30 m for air gap and for water depth should just use riser depth - air gap (to make the illustration nice).

### Calculator Details:

5. **Well Volume**: What specific volumes are needed (total capacity, annular volumes between strings, displacement, surface volumes)?
   Answer:

- The main volume should be tabulated in a table showing each section volume and at the bottom a total hole volume.
- There should also be a possibility for building a string (drill pipe), called 'String builder', with up to 3 different types of drill pipes, these should be 5 7/8" drill pipe, 5" drill pipe and 4" drill pipe.
- When there is a drill pipe in the hole, there should become a slider available ontop of the well volume table that says 'Subtract DP steel displacement' which does exactly that. For now, just estimate the inner diameter of the drill pipe for figuring out steel displacement.
- There should also show a table for the drill string volumes, for both drill pipe volume, annulus volume.

6. **Cement**: What calculations are required (slurry volume, sacks, mix water, displacement)? Should it support multiple slurry types/densities?
   Answer:

- For cementing calculations, it is mainly the cement displacement calculation that's required. How many strokes (which should be a user input), does it take to bump.
- Inputs should be cement volume to be pumped and it should calculate the required volume to pump the cement into place.

7. **Pressure Test**: Which test types (LOT, FIT, casing test) and what outputs (EMW, fracture gradient, leak rates)?
   Answer:

- Casing tests mainly (with possibilities of LOT and FIT at a later stage). The input should be type of fluid (Brine/WBM, OBM, baseoil or KFLS).
- The output should be liters, L and the calculations is L in liters = total volume being pressurized in m3 \* delta pressure / k (constant)
- The constant K should have quick select buttons for Brine/WBM (21), OBM (18), Baseoil (14) and KFLS (35)

8. **Fluid Flow**: Beyond L/min to m/s conversion, are Reynolds number or pressure drop calculations needed?
   Answer:

- Only fluid flow inside drill pipe and drill pipe / casing annulus to m/s is fine for now.
- With possibilities of adding Reynolds number calculation and Laminar/Transition/Turbulent flow at a later stage.
- Possibilities of adding pressure drop calculations at a later stage.

9. **String Lift**: What is the exact calculation method and what string properties are needed (yield strength, safety factors)?
   Answer:

- The input (inner diameter) should be the drill pipe OD and casing wall inner diameter (out diameter in calculation) and the actual pressure in bar.
- It should calculate the annular area (OD^2 - ID^2) and then perform the Force = Pressure x Area.
- OD in the calculation is the casing inner diameter and ID is the drill pipe out diameter.

### Features & UI:

10. **Units**: Should the app support both metric and imperial units with conversion toggle?
    Answer:

- There should support both metric and imperial with a toggle to be picked in the options menu.

11. **Dark Mode**: What is the desired dark mode color scheme? Auto-detect system preference?
    Answer:

- Yes, auto-dectect system preference or use a color scheme you recommend for dark mode.

12. **Export Formats**: Which formats are needed (JSON, CSV, Excel, PDF)? Should visualization be exportable as image?
    Answer:

- Excel for exporting values. The visualization can be exportable as an image.

13. **Icons**: Which icon library should be used (Lucide React, React Icons, Heroicons)?
    Answer:

- Use Lucide React

14. **Help System**: Should there be tooltips, a help sidebar, modal tutorials, or external documentation links?
    Answer:

- Yes, there should be some small tooltips for the liner buttons in the casing section.

### Technical:

15. **Deployment**: Where will this be hosted (GitHub Pages, Netlify, Vercel, Azure Static Web Apps)?
    Answer:

- This will be hosted on my GitHub page, https://github.com/OniekR - a new project.
-

16. **Authentication**: Is user login/accounts needed, or is this a standalone tool?
    Answer:

- No login or accounts are required.

17. **Multiple Wells**: Should users be able to save and switch between multiple well designs?
    Answer:

- Yes, the users should be able to save and switch between multiple well design. It should also be possible to export and import these well designs.

18. **Browser Support**: What browsers must be supported (modern Chrome/Firefox/Edge only, or also Safari, older versions)?
    Answer:

- Only newer browsers are necessary, Chrome/Firefox/Edge/Safari.

---

## Notes

- This is a **COMPLEX** feature broken into 20 commits/steps for incremental, testable progress
- Each step builds upon the previous with clear testing criteria
- Development will follow the ReactJS instructions () for best practices
- The color scheme follows the Equinor brand guidelines from the provided CSS variables
- Responsive design is prioritized throughout, not added as an afterthought
- Type safety with TypeScript will prevent common runtime errors
- localStorage provides data persistence without requiring a backend
