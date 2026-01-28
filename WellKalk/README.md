# Well Calculator App

A responsive React + TypeScript + Vite web application for building wells and running common drilling calculators (volumes, cement, pressure tests, fluid flow, string lift). It uses Tailwind CSS, React Router, and stores well data locally in the browser.

## Features
- Well builder with persistent wells (localStorage)
- SVG-based well visualization
- Drilling calculators: Well Volume, Cement, Pressure Test, Fluid Flow, String Lift
- Export well sections to Excel (XLSX)
- Dark mode with system preference & persistence
- Responsive layout with mobile-friendly navigation

## Prerequisites
- Node.js 18+ and npm

## Setup
1. Clone the repository:

   git clone <repo-url>
   cd well-calculator-app

2. Install dependencies:

   npm install

3. Start development server:

   npm run dev

   Open http://localhost:5173

4. Build for production:

   npm run build
   npm run preview

## Project structure (key files)
- `src/` — application source
  - `pages/` — page components (Home, WellBuilder, calculators)
  - `components/` — UI components and layout
  - `context/WellContext.tsx` — well data provider & persistence
  - `utils/` — calculation helpers and export utilities
  - `styles/` — CSS variables, global, responsive

## Development notes
- Routes are lazy-loaded for better performance.
- Dark mode is toggled with the theme button; preference is saved in `localStorage`.
- Export to Excel uses the `xlsx` package.

## Contributing
- Follow the repository's contribution guidelines and open a PR against `feature/well-calculator-app` for changes.

---
For more detailed usage instructions and calculation references, see `docs/USER_GUIDE.md` and `docs/CALCULATIONS.md`.
