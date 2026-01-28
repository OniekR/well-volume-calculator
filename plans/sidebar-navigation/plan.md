# Modular Left Sidebar Navigation

**Branch:** `feature/sidebar-navigation`
**Description:** Add left sidebar navigation to organize application into modular sections (Casings, Completion/DP, Settings) with extensibility for future modules

## Goal

Transform the single-page layout into a modular interface with a left sidebar navigation that organizes features into logical sections. This improves user experience by grouping related controls, reduces visual clutter, and provides a scalable structure for adding new modules. The well schematic and volume display remain on the right side, with import/export and theme controls moved into appropriate sidebar sections.

## Implementation Steps

### Step 1: Create Sidebar HTML Structure and Base CSS

**Files:** index.html, src/css/style.css
**What:** Add a new sidebar column to the grid layout (3-column: sidebar + main form + right panel). Create sidebar HTML structure with navigation sections for Casings, Completion/DP, and Settings. Implement responsive CSS that stacks the sidebar on mobile devices and keeps it sticky on desktop. Add basic styling for navigation items with hover states and active indicators.
**Testing:** Open index.html in browser, verify 3-column layout appears on desktop, sidebar collapses properly on mobile (<900px), and navigation items are styled correctly in both light and dark themes.

### Step 2: Move Controls into Sidebar Sections

**Files:** index.html, src/js/dom.js
**What:**

- Move "Hide casings" button from form header into Casings sidebar section
- Move theme toggle from page header into Settings sidebar section
- Move import/export buttons from right panel presets area into Settings sidebar section
- Add POI toggle to Completion/DP sidebar section (keep POI panel in main form for now)
- Update DOM references in dom.js to match new element locations
  **Testing:** Verify all moved controls function identically to before: hide casings works, theme toggle works, import/export works, POI toggle shows/hides the panel correctly.

### Step 3: Implement Sidebar Navigation Logic

**Files:** src/js/sidebar.js (new), src/js/script.js, src/js/ui.js
**What:** Create new sidebar.js module with navigation handlers. Implement smooth scrolling to sections when sidebar items are clicked. Add active state highlighting to show which section user is viewing. Add click handlers for toggling visibility of main form sections. Wire up sidebar initialization in script.js main initialization flow.
**Testing:** Click each sidebar navigation item and verify smooth scroll to corresponding section. Verify active state updates when scrolling manually. Test that all sidebar controls (hide casings, POI toggle, theme, import/export) work correctly from their new locations.

### Step 4: Enhance Section Organization and Collapsibility

**Files:** src/css/style.css, src/js/sidebar.js, src/js/ui.js
**What:** [NEEDS CLARIFICATION] Add ability to collapse/expand entire sidebar sections from sidebar controls. Style section headers with expand/collapse indicators. Persist sidebar section collapse state to localStorage. Add smooth transitions for section visibility changes. Optionally add icons to sidebar navigation items for better visual hierarchy.
**Testing:** Collapse and expand each sidebar section, verify state persists on page reload. Test that collapsing sections doesn't break calculations or state management. Verify smooth animations and proper responsive behavior.

### Step 5: Polish and Mobile Optimization

**Files:** src/css/style.css, src/js/sidebar.js, index.html
**What:** [NEEDS CLARIFICATION] Fine-tune responsive breakpoints for optimal mobile experience. Implement hamburger menu for sidebar on mobile (optional: sidebar slides in/out vs always visible on top). Ensure proper touch targets (min 44px) for all sidebar buttons. Add keyboard navigation support (Tab, Enter, Arrow keys) for accessibility. Test and adjust z-index layering. Add subtle box shadows and transitions for polish.
**Testing:** Test on various screen sizes (320px, 768px, 1024px, 1920px). Verify touch interactions work on mobile devices. Test keyboard-only navigation through all sidebar items. Run accessibility audit (axe DevTools or Lighthouse). Verify no visual regressions in dark mode.

## Clarifying Questions

1. **Sidebar Section Collapsibility (Step 4):** Should users be able to collapse entire sidebar sections (e.g., hide all Casings navigation items under a collapsible header)? Or should the sidebar always show all navigation items?

   Answer:

- On PC the the entire sidebar section don't need to be collapseable.

2. **Mobile Sidebar Behavior (Step 5):** On mobile devices, should the sidebar:
   - Always be visible at the top (current plan - stacks vertically)
   - Hide behind a hamburger menu that slides in/out
   - Be a bottom navigation bar with icons only

     Answer:

- On mobile the menu should be a navigation bar on bottom of the screen. This can show up to 4 or 5 buttons (or whatever makes sense on the dispaly) and should be side-scrolling if necessary.

3. **Sidebar Icons:** Would you like icons added to each navigation item (e.g., pipe icon for Casings, gear icon for Settings)? This would require choosing an icon library or using emoji/SVG.

   Answer:

- Yes, for now use https://react-icons.github.io/react-icons/ - use icons that makes sense for the given button.

4. **Additional Navigation Items:** You mentioned "and so on" for future sections. Do you have any other specific sections in mind that should be planned for now (e.g., Reports, History, Calculations)?

   Answer:

- Yes, for future buttons I want to add 'Flow velocity', Volume pressure' (calculator), 'String lift', 'Cement displacement calculation'. These are what I have in mind currently. You can add them as buttons but greyed out indicating future features coming.

5. **Presets Dropdown:** The current presets dropdown is in the right panel. Should this:
   - Move to the sidebar as a navigation item
   - Stay in the right panel where it is
   - Appear in both locations

     Answer:

- I'm not 100% sure how I want this at the moment. If you have a suggestion or recommendation regarding this, go ahead and suggest according to what is most user friendly.

6. **Active Section Highlighting:** How should the sidebar indicate which section is currently active? Options:

   - Highlight based on scroll position (auto-detect which section is in view)
   - Highlight based on last clicked item
   - No highlighting (just hover states)

     Answer:

- I want the unactive icons to be white filled icons and the currently active to be of the same icon but red (the Equinor color) filled icon.
