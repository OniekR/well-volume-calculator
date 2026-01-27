# Well Calculator Application

## Goal

Build a complete, responsive React + TypeScript + Vite web application with a well builder, shared well data context, multiple drilling calculators, dark mode, and export/import features, following the Equinor color scheme.

## Prerequisites

Make sure that the use is currently on the `feature/well-calculator-app` branch before beginning implementation.
If not, move them to the correct branch. If the branch does not exist, create it from main.

### Technology Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Lucide React
- XLSX (for Excel export)

### Step-by-Step Instructions

#### Step 1: Project Initialization & Configuration

- [x] Create the project root files listed below.
- [x] Copy and paste code below into `package.json`: 

```json
{
  "name": "well-calculator-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}
```

- [x] Copy and paste code below into `vite.config.ts`: 

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [x] Copy and paste code below into `tsconfig.json`: 

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

- [x] Copy and paste code below into `tsconfig.node.json`: 

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [x] Copy and paste code below into `tailwind.config.js`: 

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 10px 25px -15px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
```

- [x] Copy and paste code below into `postcss.config.js`: 

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [x] Copy and paste code below into `index.html`: 

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Well Calculator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [x] Copy and paste code below into `src/vite-env.d.ts`: 

```ts
/// <reference types="vite/client" />
```

- [x] Copy and paste code below into `src/main.tsx`: 

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [x] Copy and paste code below into `src/App.tsx`: 

```tsx
const App = () => {
  return (
    <div className="min-h-screen bg-[var(--eq-surface)] text-[var(--eq-text)]">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Well Calculator</h1>
        <p className="mt-3 text-[var(--eq-text-muted)]">
          Project scaffold ready. Continue with Step 2.
        </p>
      </div>
    </div>
  );
};

export default App;
```

- [x] Copy and paste code below into `.gitignore`: 

```
node_modules
.vscode
dist
.env
.DS_Store
```

##### Step 1 Verification Checklist

- [x] Run `npm install`. (completed) 
- [x] Run `npm run dev` and confirm the page renders without errors. (Vite server started at http://localhost:5173/)

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 2: Type Definitions & Data Models

- [ ] Create `src/types/well.types.ts` and paste:

```ts
export type RiserType = "drilling" | "production" | "marine" | "none";

export type WellSectionType =
  | "riser"
  | "conductor"
  | "surface"
  | "intermediate"
  | "production"
  | "reservoir"
  | "small"
  | "openHole";

export interface CasingProfile {
  label: string;
  outerDiameterIn: number;
  innerDiameterIn: number;
  driftIn: number;
  weightPerFt: number;
  grade: string;
}

export interface WellSection {
  id: string;
  type: WellSectionType;
  name: string;
  topMd: number;
  shoeMd: number;
  outerDiameterIn: number;
  innerDiameterIn: number;
  driftIn: number;
  weightPerFt: number;
  grade: string;
  isLiner?: boolean;
}

export interface WellDesign {
  id: string;
  name: string;
  airGapM: number;
  waterDepthM: number;
  riserDepthM?: number;
  sections: WellSection[];
  createdAt: string;
  updatedAt: string;
}
```

- [ ] Create `src/types/calculator.types.ts` and paste:

```ts
export type UnitSystem = "metric" | "imperial";

export interface VolumeRow {
  label: string;
  lengthM: number;
  diameterIn: number;
  volumeM3: number;
}

export interface CementInputs {
  cementVolumeM3: number;
  strokeVolumeM3: number;
  strokesPerBarrel: number;
}

export interface PressureTestInputs {
  totalVolumeM3: number;
  deltaPressureBar: number;
  kFactor: number;
}

export interface FlowInputs {
  flowRateLpm: number;
  outerDiameterIn: number;
  innerDiameterIn: number;
}

export interface StringLiftInputs {
  casingInnerDiameterIn: number;
  drillPipeOuterDiameterIn: number;
  pressureBar: number;
}
```

- [ ] Create `src/types/common.types.ts` and paste:

```ts
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}
```

##### Step 2 Verification Checklist

- [ ] `npm run build` succeeds with no TypeScript errors.

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 3: Core Layout & Responsive Navigation

- [ ] Create `src/styles/variables.css` and paste:

```css
:root {
  --eq-surface: #f7f9fb;
  --eq-surface-strong: #ffffff;
  --eq-text: #0b1b2a;
  --eq-text-muted: #4a5c6b;
  --eq-border: #d7e0e8;
  --eq-primary: #0072ce;
  --eq-primary-strong: #00549a;
  --eq-success: #2f7d32;
  --eq-warning: #f0ad4e;
  --eq-danger: #c62828;
  --eq-tubing-green: #00a36c;
}

.dark {
  --eq-surface: #0b1116;
  --eq-surface-strong: #141c22;
  --eq-text: #e8eef4;
  --eq-text-muted: #9fb0c0;
  --eq-border: #24313b;
  --eq-primary: #5aa7ff;
  --eq-primary-strong: #2f7edb;
  --eq-success: #67d19a;
  --eq-warning: #f6c87c;
  --eq-danger: #ff8a8a;
  --eq-tubing-green: #39d98a;
}
```

- [ ] Create `src/styles/globals.css` and paste:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./variables.css";

* {
  box-sizing: border-box;
}

body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  background: var(--eq-surface);
  color: var(--eq-text);
}
```

- [ ] Create `src/components/layout/Layout.tsx` and paste:

```tsx
import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[var(--eq-surface)] text-[var(--eq-text)]">
      <Header />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 pt-6 md:px-8">
        <Sidebar />
        <main className="w-full flex-1 rounded-3xl bg-[var(--eq-surface-strong)] p-6 shadow-card">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default Layout;
```

- [ ] Create `src/components/layout/Header.tsx` and paste:

```tsx
import { Droplets } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
  return (
    <header className="border-b border-[var(--eq-border)] bg-[var(--eq-surface-strong)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--eq-primary)] text-white">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--eq-text-muted)]">
              Well Engineering
            </p>
            <h1 className="text-lg font-semibold">Well Calculator</h1>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
```

- [ ] Create `src/components/layout/Sidebar.tsx` and paste:

```tsx
import { NavLink } from "react-router-dom";
import { Calculator, Home, Layers, Wrench } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/builder", label: "Well Builder", icon: Layers },
  { to: "/calculators/volumes", label: "Well Volume", icon: Calculator },
  { to: "/calculators/cement", label: "Cement", icon: Wrench },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-2 rounded-3xl bg-[var(--eq-surface-strong)] p-4 shadow-card md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[var(--eq-primary)] text-white"
                  : "text-[var(--eq-text-muted)] hover:bg-[var(--eq-surface)]"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
```

- [ ] Create `src/components/layout/MobileNav.tsx` and paste:

```tsx
import { NavLink } from "react-router-dom";
import { Calculator, Home, Layers, Wrench } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/builder", label: "Builder", icon: Layers },
  { to: "/calculators/volumes", label: "Volume", icon: Calculator },
  { to: "/calculators/cement", label: "Cement", icon: Wrench },
];

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--eq-border)] bg-[var(--eq-surface-strong)] px-4 py-3 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive
                    ? "text-[var(--eq-primary)]"
                    : "text-[var(--eq-text-muted)]"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
```

- [ ] Create `src/components/ui/ThemeToggle.tsx` and paste:

```tsx
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const saved = localStorage.getItem("theme");
    const nextIsDark = saved ? saved === "dark" : prefersDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-2xl border border-[var(--eq-border)] px-4 py-2 text-sm text-[var(--eq-text-muted)]"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      {isDark ? "Dark" : "Light"}
    </button>
  );
};

export default ThemeToggle;
```

##### Step 3 Verification Checklist

- [ ] Resize the browser to confirm sidebar hides on mobile and mobile nav appears.
- [ ] Toggle dark mode and confirm colors update.

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 4: Routing & Page Structure

- [ ] Update `src/App.tsx` to:

```tsx
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import WellBuilderPage from "./pages/WellBuilderPage";
import WellVolumeCalculator from "./pages/calculators/WellVolumeCalculator";
import CementCalculator from "./pages/calculators/CementCalculator";
import PressureTestCalculator from "./pages/calculators/PressureTestCalculator";
import FluidFlowCalculator from "./pages/calculators/FluidFlowCalculator";
import StringLiftCalculator from "./pages/calculators/StringLiftCalculator";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<WellBuilderPage />} />
        <Route path="/calculators/volumes" element={<WellVolumeCalculator />} />
        <Route path="/calculators/cement" element={<CementCalculator />} />
        <Route
          path="/calculators/pressure"
          element={<PressureTestCalculator />}
        />
        <Route path="/calculators/flow" element={<FluidFlowCalculator />} />
        <Route path="/calculators/lift" element={<StringLiftCalculator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
```

- [ ] Create `src/pages/Home.tsx` and paste:

```tsx
const Home = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Welcome</h2>
      <p className="text-[var(--eq-text-muted)]">
        Use the navigation to build a well, visualize geometry, and access
        drilling calculators.
      </p>
    </section>
  );
};

export default Home;
```

- [ ] Create `src/pages/WellBuilderPage.tsx` and paste:

```tsx
const WellBuilderPage = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Well Builder</h2>
      <p className="text-[var(--eq-text-muted)]">
        Build your well sections and visualize geometry.
      </p>
    </section>
  );
};

export default WellBuilderPage;
```

- [ ] Create calculator pages:

`src/pages/calculators/WellVolumeCalculator.tsx`

```tsx
const WellVolumeCalculator = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Well Volume Calculator</h2>
      <p className="text-[var(--eq-text-muted)]">
        Compute section volumes and totals.
      </p>
    </section>
  );
};

export default WellVolumeCalculator;
```

`src/pages/calculators/CementCalculator.tsx`

```tsx
const CementCalculator = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Cement Calculator</h2>
      <p className="text-[var(--eq-text-muted)]">
        Estimate cement displacement and strokes.
      </p>
    </section>
  );
};

export default CementCalculator;
```

`src/pages/calculators/PressureTestCalculator.tsx`

```tsx
const PressureTestCalculator = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Pressure Test Calculator</h2>
      <p className="text-[var(--eq-text-muted)]">
        Calculate pressurization volume.
      </p>
    </section>
  );
};

export default PressureTestCalculator;
```

`src/pages/calculators/FluidFlowCalculator.tsx`

```tsx
const FluidFlowCalculator = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Fluid Flow Calculator</h2>
      <p className="text-[var(--eq-text-muted)]">
        Convert flow rate to annular velocity.
      </p>
    </section>
  );
};

export default FluidFlowCalculator;
```

`src/pages/calculators/StringLiftCalculator.tsx`

```tsx
const StringLiftCalculator = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">String Lift Calculator</h2>
      <p className="text-[var(--eq-text-muted)]">
        Compute lift force from pressure.
      </p>
    </section>
  );
};

export default StringLiftCalculator;
```

##### Step 4 Verification Checklist

- [ ] Navigate to all routes and confirm pages render.
- [ ] Use back/forward browser buttons successfully.

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 5: Shared UI Components

- [ ] Create `src/components/ui/Button.tsx`:

```tsx
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        variant === "primary" &&
          "bg-[var(--eq-primary)] text-white hover:bg-[var(--eq-primary-strong)]",
        variant === "secondary" &&
          "border border-[var(--eq-border)] text-[var(--eq-text)] hover:bg-[var(--eq-surface)]",
        variant === "danger" && "bg-[var(--eq-danger)] text-white",
        className,
      )}
      {...props}
    />
  );
};

export default Button;
```

- [ ] Create `src/components/ui/Card.tsx`:

```tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface-strong)] p-5",
        className,
      )}
    >
      {title && <h3 className="mb-3 text-base font-semibold">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
```

- [ ] Create `src/components/ui/Input.tsx`:

```tsx
import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = ({ hasError, className, ...props }: InputProps) => {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border px-3 py-2 text-sm focus:outline-none",
        hasError ? "border-[var(--eq-danger)]" : "border-[var(--eq-border)]",
        className,
      )}
      {...props}
    />
  );
};

export default Input;
```

- [ ] Create `src/components/ui/Select.tsx`:

```tsx
import { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = ({ hasError, className, ...props }: SelectProps) => {
  return (
    <select
      className={clsx(
        "w-full rounded-2xl border bg-transparent px-3 py-2 text-sm focus:outline-none",
        hasError ? "border-[var(--eq-danger)]" : "border-[var(--eq-border)]",
        className,
      )}
      {...props}
    />
  );
};

export default Select;
```

- [ ] Create `src/components/ui/Label.tsx`:

```tsx
import { LabelHTMLAttributes } from "react";
import clsx from "clsx";

const Label = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={clsx(
        "text-xs font-semibold text-[var(--eq-text-muted)]",
        className,
      )}
      {...props}
    />
  );
};

export default Label;
```

- [ ] Create `src/components/ui/Badge.tsx`:

```tsx
import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  tone?: "neutral" | "success" | "warning";
  children: ReactNode;
}

const Badge = ({ tone = "neutral", children }: BadgeProps) => {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-1 text-xs font-medium",
        tone === "neutral" &&
          "bg-[var(--eq-surface)] text-[var(--eq-text-muted)]",
        tone === "success" && "bg-[var(--eq-success)] text-white",
        tone === "warning" && "bg-[var(--eq-warning)] text-white",
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
```

##### Step 5 Verification Checklist

- [ ] Create a temporary test page and verify all variants render correctly in light and dark mode.

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 6: Well Data Context & State Management

- [ ] Create `src/hooks/useLocalStorage.ts`:

```ts
import { useEffect, useState } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
```

- [ ] Create `src/context/WellContext.tsx`:

```tsx
import { createContext, ReactNode, useMemo } from "react";
import { WellDesign, WellSection } from "../types/well.types";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface WellContextValue {
  wells: WellDesign[];
  activeWellId: string | null;
  activeWell: WellDesign | null;
  setActiveWell: (id: string) => void;
  saveWell: (well: WellDesign) => void;
  deleteWell: (id: string) => void;
  updateSections: (sections: WellSection[]) => void;
}

export const WellContext = createContext<WellContextValue | undefined>(
  undefined,
);

interface WellProviderProps {
  children: ReactNode;
}

const createDefaultWell = (): WellDesign => ({
  id: crypto.randomUUID(),
  name: "New Well",
  airGapM: 30,
  waterDepthM: 300,
  riserDepthM: 330,
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const WellProvider = ({ children }: WellProviderProps) => {
  const [wells, setWells] = useLocalStorage<WellDesign[]>("wells", [
    createDefaultWell(),
  ]);
  const [activeWellId, setActiveWellId] = useLocalStorage<string | null>(
    "activeWellId",
    wells[0]?.id ?? null,
  );

  const activeWell = useMemo(
    () => wells.find((well) => well.id === activeWellId) ?? null,
    [wells, activeWellId],
  );

  const setActiveWell = (id: string) => {
    setActiveWellId(id);
  };

  const saveWell = (well: WellDesign) => {
    setWells((prev) => {
      const exists = prev.find((item) => item.id === well.id);
      if (exists) {
        return prev.map((item) =>
          item.id === well.id
            ? { ...well, updatedAt: new Date().toISOString() }
            : item,
        );
      }
      return [...prev, { ...well, updatedAt: new Date().toISOString() }];
    });
  };

  const deleteWell = (id: string) => {
    setWells((prev) => prev.filter((item) => item.id !== id));
    if (activeWellId === id) {
      setActiveWellId(wells[0]?.id ?? null);
    }
  };

  const updateSections = (sections: WellSection[]) => {
    if (!activeWell) return;
    saveWell({ ...activeWell, sections });
  };

  const value = {
    wells,
    activeWellId,
    activeWell,
    setActiveWell,
    saveWell,
    deleteWell,
    updateSections,
  };

  return <WellContext.Provider value={value}>{children}</WellContext.Provider>;
};
```

- [ ] Create `src/hooks/useWellData.ts`:

```ts
import { useContext } from "react";
import { WellContext } from "../context/WellContext";

export const useWellData = () => {
  const ctx = useContext(WellContext);
  if (!ctx) {
    throw new Error("useWellData must be used within WellProvider");
  }
  return ctx;
};
```

- [ ] Wrap the app in `WellProvider` by updating `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import { WellProvider } from "./context/WellContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WellProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </WellProvider>
  </React.StrictMode>,
);
```

##### Step 6 Verification Checklist

- [ ] Build a simple well in context and confirm data persists after refresh.

#### Step 6 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 7: Well Builder Core Functionality

- [ ] Create `src/utils/wellValidation.ts`:

```ts
import { WellSection } from "../types/well.types";

export const validateSections = (sections: WellSection[]) => {
  const issues: string[] = [];
  const sorted = [...sections].sort((a, b) => a.topMd - b.topMd);

  sorted.forEach((section, index) => {
    if (section.shoeMd <= section.topMd) {
      issues.push(`${section.name} shoe depth must be deeper than top MD.`);
    }
    if (index > 0) {
      const previous = sorted[index - 1];
      if (section.outerDiameterIn >= previous.driftIn) {
        issues.push(
          `${section.name} may not fit inside ${previous.name} drift ID.`,
        );
      }
    }
  });

  return issues;
};
```

- [ ] Create `src/components/well-builder/WellSectionForm.tsx`:

```tsx
import { useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";
import { WellSection, WellSectionType } from "../../types/well.types";

const sectionOptions: { label: string; value: WellSectionType }[] = [
  { label: "Riser", value: "riser" },
  { label: "Conductor", value: "conductor" },
  { label: "Surface Casing", value: "surface" },
  { label: "Intermediate Casing", value: "intermediate" },
  { label: "Production Casing/Liner", value: "production" },
  { label: "Reservoir Liner", value: "reservoir" },
  { label: "Small Liner", value: "small" },
  { label: "Open Hole", value: "openHole" },
];

const casingProfiles = [
  {
    label: "30 in",
    outerDiameterIn: 30,
    innerDiameterIn: 28,
    driftIn: 27.5,
    weightPerFt: 200,
    grade: "K-55",
  },
  {
    label: "20 in",
    outerDiameterIn: 20,
    innerDiameterIn: 18,
    driftIn: 17.5,
    weightPerFt: 133,
    grade: "K-55",
  },
  {
    label: "18 5/8 in",
    outerDiameterIn: 18.625,
    innerDiameterIn: 17.5,
    driftIn: 17.0,
    weightPerFt: 120,
    grade: "L-80",
  },
  {
    label: "13 3/8 in",
    outerDiameterIn: 13.375,
    innerDiameterIn: 12.3,
    driftIn: 12.0,
    weightPerFt: 80,
    grade: "L-80",
  },
  {
    label: "9 5/8 in",
    outerDiameterIn: 9.625,
    innerDiameterIn: 8.8,
    driftIn: 8.6,
    weightPerFt: 53.5,
    grade: "L-80",
  },
  {
    label: "7 in",
    outerDiameterIn: 7,
    innerDiameterIn: 6.2,
    driftIn: 6.0,
    weightPerFt: 38,
    grade: "P-110",
  },
  {
    label: "4 1/2 in",
    outerDiameterIn: 4.5,
    innerDiameterIn: 4.0,
    driftIn: 3.9,
    weightPerFt: 24,
    grade: "P-110",
  },
  {
    label: "17 1/2 in",
    outerDiameterIn: 17.5,
    innerDiameterIn: 17.5,
    driftIn: 17.5,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "16 in",
    outerDiameterIn: 16,
    innerDiameterIn: 16,
    driftIn: 16,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "12 1/4 in",
    outerDiameterIn: 12.25,
    innerDiameterIn: 12.25,
    driftIn: 12.25,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "8 1/2 in",
    outerDiameterIn: 8.5,
    innerDiameterIn: 8.5,
    driftIn: 8.5,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "6 in",
    outerDiameterIn: 6,
    innerDiameterIn: 6,
    driftIn: 6,
    weightPerFt: 0,
    grade: "Open",
  },
];

interface WellSectionFormProps {
  onAdd: (section: WellSection) => void;
}

const WellSectionForm = ({ onAdd }: WellSectionFormProps) => {
  const [type, setType] = useState<WellSectionType>("riser");
  const [topMd, setTopMd] = useState(0);
  const [shoeMd, setShoeMd] = useState(100);
  const [profileIndex, setProfileIndex] = useState(0);

  const profile = useMemo(() => casingProfiles[profileIndex], [profileIndex]);

  const handleAdd = () => {
    const section: WellSection = {
      id: crypto.randomUUID(),
      type,
      name:
        sectionOptions.find((option) => option.value === type)?.label ??
        "Section",
      topMd,
      shoeMd,
      outerDiameterIn: profile.outerDiameterIn,
      innerDiameterIn: profile.innerDiameterIn,
      driftIn: profile.driftIn,
      weightPerFt: profile.weightPerFt,
      grade: profile.grade,
    };
    onAdd(section);
  };

  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <div>
        <Label htmlFor="section-type">Section Type</Label>
        <Select
          id="section-type"
          value={type}
          onChange={(event) => setType(event.target.value as WellSectionType)}
        >
          {sectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="top-md">Top MD (m)</Label>
          <Input
            id="top-md"
            type="number"
            value={topMd}
            onChange={(event) => setTopMd(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="shoe-md">Shoe MD (m)</Label>
          <Input
            id="shoe-md"
            type="number"
            value={shoeMd}
            onChange={(event) => setShoeMd(Number(event.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="profile">Outer Diameter</Label>
        <Select
          id="profile"
          value={profileIndex}
          onChange={(event) => setProfileIndex(Number(event.target.value))}
        >
          {casingProfiles.map((item, index) => (
            <option key={item.label} value={index}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleAdd}>Add Section</Button>
    </div>
  );
};

export default WellSectionForm;
```

- [ ] Create `src/components/well-builder/SectionCard.tsx`:

```tsx
import { AlertTriangle, Trash2 } from "lucide-react";
import { WellSection } from "../../types/well.types";
import Button from "../ui/Button";

interface SectionCardProps {
  section: WellSection;
  showWarning?: boolean;
  onDelete: () => void;
}

const SectionCard = ({ section, showWarning, onDelete }: SectionCardProps) => {
  return (
    <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold">{section.name}</h4>
          <p className="text-xs text-[var(--eq-text-muted)]">
            {section.topMd} m → {section.shoeMd} m | OD{" "}
            {section.outerDiameterIn} in
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showWarning && (
            <AlertTriangle size={16} className="text-[var(--eq-warning)]" />
          )}
          <Button
            variant="secondary"
            onClick={onDelete}
            aria-label="Delete section"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
```

- [ ] Create `src/components/well-builder/SectionList.tsx`:

```tsx
import { WellSection } from "../../types/well.types";
import SectionCard from "./SectionCard";

interface SectionListProps {
  sections: WellSection[];
  warnings: string[];
  onDelete: (id: string) => void;
}

const SectionList = ({ sections, warnings, onDelete }: SectionListProps) => {
  if (sections.length === 0) {
    return (
      <p className="text-sm text-[var(--eq-text-muted)]">
        No sections added yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          onDelete={() => onDelete(section.id)}
          showWarning={warnings.some((warning) =>
            warning.includes(section.name),
          )}
        />
      ))}
    </div>
  );
};

export default SectionList;
```

- [ ] Update `src/pages/WellBuilderPage.tsx` to:

```tsx
import { useMemo } from "react";
import { useWellData } from "../hooks/useWellData";
import WellSectionForm from "../components/well-builder/WellSectionForm";
import SectionList from "../components/well-builder/SectionList";
import { validateSections } from "../utils/wellValidation";

const WellBuilderPage = () => {
  const { activeWell, updateSections } = useWellData();

  const warnings = useMemo(
    () => validateSections(activeWell?.sections ?? []),
    [activeWell?.sections],
  );

  if (!activeWell) {
    return (
      <p className="text-[var(--eq-text-muted)]">No active well selected.</p>
    );
  }

  const handleAdd = (section: (typeof activeWell.sections)[number]) => {
    updateSections([...activeWell.sections, section]);
  };

  const handleDelete = (id: string) => {
    updateSections(activeWell.sections.filter((section) => section.id !== id));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Well Builder</h2>
          <p className="text-[var(--eq-text-muted)]">
            Add casing strings, liners, and open hole sections.
          </p>
        </div>
        <WellSectionForm onAdd={handleAdd} />
        <SectionList
          sections={activeWell.sections}
          warnings={warnings}
          onDelete={handleDelete}
        />
      </div>
      <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
        <p className="text-sm text-[var(--eq-text-muted)]">
          Visualization will appear here in Step 8.
        </p>
      </div>
    </section>
  );
};

export default WellBuilderPage;
```

##### Step 7 Verification Checklist

- [ ] Add multiple sections and delete them.
- [ ] Confirm warnings appear when casing OD exceeds previous drift.

#### Step 7 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 8: Well Visualization Component

- [ ] Create `src/utils/wellGeometry.ts`:

```ts
import { WellSection } from "../types/well.types";

export interface WellSlice {
  id: string;
  label: string;
  depthTop: number;
  depthBottom: number;
  diameter: number;
  color: string;
}

export const buildSlices = (sections: WellSection[]): WellSlice[] => {
  return sections.map((section) => ({
    id: section.id,
    label: section.name,
    depthTop: section.topMd,
    depthBottom: section.shoeMd,
    diameter: section.outerDiameterIn,
    color: section.type === "production" ? "var(--eq-tubing-green)" : "#90a4b4",
  }));
};
```

- [ ] Create `src/components/well-builder/WellCanvas.tsx`:

```tsx
import { WellSlice } from "../../utils/wellGeometry";

interface WellCanvasProps {
  slices: WellSlice[];
}

const WellCanvas = ({ slices }: WellCanvasProps) => {
  const maxDepth = Math.max(100, ...slices.map((slice) => slice.depthBottom));
  const maxDiameter = Math.max(10, ...slices.map((slice) => slice.diameter));

  return (
    <svg viewBox={`0 0 200 ${maxDepth + 50}`} className="h-[420px] w-full">
      {slices.map((slice) => {
        const width = (slice.diameter / maxDiameter) * 120;
        const x = 100 - width / 2;
        const height = slice.depthBottom - slice.depthTop;
        return (
          <g key={slice.id}>
            <rect
              x={x}
              y={slice.depthTop}
              width={width}
              height={height}
              fill={slice.color}
              opacity={0.8}
            />
            <text
              x={10}
              y={slice.depthTop + 14}
              fontSize="8"
              fill="currentColor"
            >
              {slice.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default WellCanvas;
```

- [ ] Create `src/components/well-builder/WellVisualization.tsx`:

```tsx
import { WellSection } from "../../types/well.types";
import { buildSlices } from "../../utils/wellGeometry";
import WellCanvas from "./WellCanvas";

interface WellVisualizationProps {
  sections: WellSection[];
}

const WellVisualization = ({ sections }: WellVisualizationProps) => {
  const slices = buildSlices(sections);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Well Visualization</h3>
      {sections.length === 0 ? (
        <p className="text-sm text-[var(--eq-text-muted)]">
          Add sections to view the schematic.
        </p>
      ) : (
        <WellCanvas slices={slices} />
      )}
    </div>
  );
};

export default WellVisualization;
```

- [ ] Update `src/pages/WellBuilderPage.tsx` right panel to render `WellVisualization`:

```tsx
import { useMemo } from "react";
import { useWellData } from "../hooks/useWellData";
import WellSectionForm from "../components/well-builder/WellSectionForm";
import SectionList from "../components/well-builder/SectionList";
import { validateSections } from "../utils/wellValidation";
import WellVisualization from "../components/well-builder/WellVisualization";

const WellBuilderPage = () => {
  const { activeWell, updateSections } = useWellData();

  const warnings = useMemo(
    () => validateSections(activeWell?.sections ?? []),
    [activeWell?.sections],
  );

  if (!activeWell) {
    return (
      <p className="text-[var(--eq-text-muted)]">No active well selected.</p>
    );
  }

  const handleAdd = (section: (typeof activeWell.sections)[number]) => {
    updateSections([...activeWell.sections, section]);
  };

  const handleDelete = (id: string) => {
    updateSections(activeWell.sections.filter((section) => section.id !== id));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Well Builder</h2>
          <p className="text-[var(--eq-text-muted)]">
            Add casing strings, liners, and open hole sections.
          </p>
        </div>
        <WellSectionForm onAdd={handleAdd} />
        <SectionList
          sections={activeWell.sections}
          warnings={warnings}
          onDelete={handleDelete}
        />
      </div>
      <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
        <WellVisualization sections={activeWell.sections} />
      </div>
    </section>
  );
};

export default WellBuilderPage;
```

##### Step 8 Verification Checklist

- [ ] Add 3–4 sections and confirm the SVG schematic appears.

#### Step 8 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 9: Well Volume Calculator

- [ ] Create `src/utils/volumeCalculations.ts`:

```ts
import { VolumeRow } from "../types/calculator.types";

const INCH_TO_M = 0.0254;

export const calculateCylinderVolume = (
  diameterIn: number,
  lengthM: number,
) => {
  const radiusM = (diameterIn * INCH_TO_M) / 2;
  return Math.PI * radiusM * radiusM * lengthM;
};

export const buildSectionVolumes = (rows: VolumeRow[]) => {
  return rows.map((row) => ({
    ...row,
    volumeM3: calculateCylinderVolume(row.diameterIn, row.lengthM),
  }));
};
```

- [ ] Create `src/components/calculators/shared/CalculatorLayout.tsx`:

```tsx
import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const CalculatorLayout = ({
  title,
  description,
  children,
}: CalculatorLayoutProps) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-[var(--eq-text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
};

export default CalculatorLayout;
```

- [ ] Create `src/components/calculators/shared/ResultCard.tsx`:

```tsx
import { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  value: string;
  children?: ReactNode;
}

const ResultCard = ({ title, value, children }: ResultCardProps) => {
  return (
    <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--eq-text-muted)]">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {children}
    </div>
  );
};

export default ResultCard;
```

- [ ] Update `src/pages/calculators/WellVolumeCalculator.tsx`:

```tsx
import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import ResultCard from "../../components/calculators/shared/ResultCard";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { buildSectionVolumes } from "../../utils/volumeCalculations";

const WellVolumeCalculator = () => {
  const [lengthM, setLengthM] = useState(1000);
  const [diameterIn, setDiameterIn] = useState(12.25);

  const rows = useMemo(
    () => buildSectionVolumes([{ label: "Open Hole", lengthM, diameterIn }]),
    [lengthM, diameterIn],
  );

  const totalVolume = rows.reduce((sum, row) => sum + row.volumeM3, 0);

  return (
    <CalculatorLayout
      title="Well Volume Calculator"
      description="Compute section volumes and totals."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="length">Section Length (m)</Label>
          <Input
            id="length"
            type="number"
            value={lengthM}
            onChange={(event) => setLengthM(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="diameter">Section Diameter (in)</Label>
          <Input
            id="diameter"
            type="number"
            value={diameterIn}
            onChange={(event) => setDiameterIn(Number(event.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Total Hole Volume"
        value={`${totalVolume.toFixed(2)} m³`}
      />
    </CalculatorLayout>
  );
};

export default WellVolumeCalculator;
```

##### Step 9 Verification Checklist

- [ ] Input a known diameter and length, confirm the volume matches manual calculations.

#### Step 9 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 10: Well Cement Calculator

- [ ] Create `src/utils/cementCalculations.ts`:

```ts
export const calculateStrokesToBump = (
  cementVolumeM3: number,
  strokeVolumeM3: number,
) => {
  if (strokeVolumeM3 <= 0) return 0;
  return cementVolumeM3 / strokeVolumeM3;
};
```

- [ ] Update `src/pages/calculators/CementCalculator.tsx`:

```tsx
import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculateStrokesToBump } from "../../utils/cementCalculations";

const CementCalculator = () => {
  const [cementVolumeM3, setCementVolumeM3] = useState(30);
  const [strokeVolumeM3, setStrokeVolumeM3] = useState(0.05);

  const strokes = useMemo(
    () => calculateStrokesToBump(cementVolumeM3, strokeVolumeM3),
    [cementVolumeM3, strokeVolumeM3],
  );

  return (
    <CalculatorLayout
      title="Cement Calculator"
      description="Estimate cement displacement strokes."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="cement-volume">Cement Volume (m³)</Label>
          <Input
            id="cement-volume"
            type="number"
            value={cementVolumeM3}
            onChange={(event) => setCementVolumeM3(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="stroke-volume">Stroke Volume (m³)</Label>
          <Input
            id="stroke-volume"
            type="number"
            value={strokeVolumeM3}
            onChange={(event) => setStrokeVolumeM3(Number(event.target.value))}
          />
        </div>
      </div>
      <ResultCard title="Strokes to Bump" value={strokes.toFixed(1)} />
    </CalculatorLayout>
  );
};

export default CementCalculator;
```

##### Step 10 Verification Checklist

- [ ] Validate that the stroke calculation matches expected manual results.

#### Step 10 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 11: Pressure Test Calculator

- [ ] Create `src/utils/pressureCalculations.ts`:

```ts
export const calculatePressurizedLiters = (
  volumeM3: number,
  deltaPressureBar: number,
  kFactor: number,
) => {
  if (kFactor <= 0) return 0;
  return ((volumeM3 * deltaPressureBar) / kFactor) * 1000;
};
```

- [ ] Update `src/pages/calculators/PressureTestCalculator.tsx`:

```tsx
import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import Button from "../../components/ui/Button";
import { calculatePressurizedLiters } from "../../utils/pressureCalculations";

const kOptions = [
  { label: "Brine/WBM", value: 21 },
  { label: "OBM", value: 18 },
  { label: "Baseoil", value: 14 },
  { label: "KFLS", value: 35 },
];

const PressureTestCalculator = () => {
  const [volumeM3, setVolumeM3] = useState(12);
  const [deltaPressureBar, setDeltaPressureBar] = useState(50);
  const [kFactor, setKFactor] = useState(21);

  const liters = useMemo(
    () => calculatePressurizedLiters(volumeM3, deltaPressureBar, kFactor),
    [volumeM3, deltaPressureBar, kFactor],
  );

  return (
    <CalculatorLayout
      title="Pressure Test Calculator"
      description="Compute pressurized fluid volume in liters."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="volume">Total Volume (m³)</Label>
          <Input
            id="volume"
            type="number"
            value={volumeM3}
            onChange={(event) => setVolumeM3(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="delta">Delta Pressure (bar)</Label>
          <Input
            id="delta"
            type="number"
            value={deltaPressureBar}
            onChange={(event) =>
              setDeltaPressureBar(Number(event.target.value))
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {kOptions.map((option) => (
          <Button
            key={option.value}
            variant={kFactor === option.value ? "primary" : "secondary"}
            onClick={() => setKFactor(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <ResultCard title="Required Liters" value={`${liters.toFixed(1)} L`} />
    </CalculatorLayout>
  );
};

export default PressureTestCalculator;
```

##### Step 11 Verification Checklist

- [ ] Confirm liters output matches manual calculation.

#### Step 11 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 12: Fluid Flow Calculator

- [ ] Create `src/utils/unitConversions.ts`:

```ts
export const lpmToM3s = (lpm: number) => lpm / 1000 / 60;
```

- [ ] Create `src/utils/flowCalculations.ts`:

```ts
import { lpmToM3s } from "./unitConversions";

const INCH_TO_M = 0.0254;

export const calculateAnnularVelocity = (
  flowRateLpm: number,
  outerDiameterIn: number,
  innerDiameterIn: number,
) => {
  const area =
    Math.PI * Math.pow((outerDiameterIn * INCH_TO_M) / 2, 2) -
    Math.PI * Math.pow((innerDiameterIn * INCH_TO_M) / 2, 2);
  if (area <= 0) return 0;
  return lpmToM3s(flowRateLpm) / area;
};
```

- [ ] Update `src/pages/calculators/FluidFlowCalculator.tsx`:

```tsx
import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculateAnnularVelocity } from "../../utils/flowCalculations";

const FluidFlowCalculator = () => {
  const [flowRateLpm, setFlowRateLpm] = useState(1000);
  const [outerDiameterIn, setOuterDiameterIn] = useState(12.25);
  const [innerDiameterIn, setInnerDiameterIn] = useState(5);

  const velocity = useMemo(
    () =>
      calculateAnnularVelocity(flowRateLpm, outerDiameterIn, innerDiameterIn),
    [flowRateLpm, outerDiameterIn, innerDiameterIn],
  );

  return (
    <CalculatorLayout
      title="Fluid Flow Calculator"
      description="Convert flow rate to annular velocity."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="flow">Flow Rate (L/min)</Label>
          <Input
            id="flow"
            type="number"
            value={flowRateLpm}
            onChange={(event) => setFlowRateLpm(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="outer">Outer Diameter (in)</Label>
          <Input
            id="outer"
            type="number"
            value={outerDiameterIn}
            onChange={(event) => setOuterDiameterIn(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="inner">Inner Diameter (in)</Label>
          <Input
            id="inner"
            type="number"
            value={innerDiameterIn}
            onChange={(event) => setInnerDiameterIn(Number(event.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Annular Velocity"
        value={`${velocity.toFixed(3)} m/s`}
      />
    </CalculatorLayout>
  );
};

export default FluidFlowCalculator;
```

##### Step 12 Verification Checklist

- [ ] Verify annular velocity matches manual calculations for sample data.

#### Step 12 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 13: String Lift Calculator

- [ ] Create `src/utils/liftCalculations.ts`:

```ts
const INCH_TO_M = 0.0254;

export const calculateLiftForce = (
  casingIdIn: number,
  drillPipeOdIn: number,
  pressureBar: number,
) => {
  const area =
    Math.PI * Math.pow((casingIdIn * INCH_TO_M) / 2, 2) -
    Math.PI * Math.pow((drillPipeOdIn * INCH_TO_M) / 2, 2);
  const pressurePa = pressureBar * 1e5;
  return pressurePa * area;
};
```

- [ ] Update `src/pages/calculators/StringLiftCalculator.tsx`:

```tsx
import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculateLiftForce } from "../../utils/liftCalculations";

const StringLiftCalculator = () => {
  const [casingId, setCasingId] = useState(8.6);
  const [pipeOd, setPipeOd] = useState(5);
  const [pressureBar, setPressureBar] = useState(150);

  const force = useMemo(
    () => calculateLiftForce(casingId, pipeOd, pressureBar),
    [casingId, pipeOd, pressureBar],
  );

  return (
    <CalculatorLayout
      title="String Lift Calculator"
      description="Compute lift force from pressure."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="casing-id">Casing ID (in)</Label>
          <Input
            id="casing-id"
            type="number"
            value={casingId}
            onChange={(event) => setCasingId(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pipe-od">Drill Pipe OD (in)</Label>
          <Input
            id="pipe-od"
            type="number"
            value={pipeOd}
            onChange={(event) => setPipeOd(Number(event.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pressure">Pressure (bar)</Label>
          <Input
            id="pressure"
            type="number"
            value={pressureBar}
            onChange={(event) => setPressureBar(Number(event.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Lift Force"
        value={`${(force / 1000).toFixed(1)} kN`}
      />
    </CalculatorLayout>
  );
};

export default StringLiftCalculator;
```

##### Step 13 Verification Checklist

- [ ] Confirm lift force matches a hand calculation for sample input.

#### Step 13 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 14: Calculator Data Integration

- [ ] Create `src/hooks/useCalculatorData.ts`:

```ts
import { useWellData } from "./useWellData";

export const useCalculatorData = () => {
  const { activeWell } = useWellData();

  const getTopSection = () => activeWell?.sections[0];

  return {
    activeWell,
    getTopSection,
  };
};
```

- [ ] Add a “Use Well Data” button to each calculator page and wire to the active well section where applicable.

##### Step 14 Verification Checklist

- [ ] Build a well and confirm calculator inputs can be populated from the active well.

#### Step 14 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 15: Export & Data Persistence

- [ ] Update `package.json` to add XLSX dependency:

```json
{
  "name": "well-calculator-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.2",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.1",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}
```

- [ ] Create `src/utils/exportHelpers.ts`:

```ts
import * as XLSX from "xlsx";
import { WellDesign } from "../types/well.types";

export const exportWellToExcel = (well: WellDesign) => {
  const rows = well.sections.map((section) => ({
    Name: section.name,
    TopMD: section.topMd,
    ShoeMD: section.shoeMd,
    OuterDiameterIn: section.outerDiameterIn,
    InnerDiameterIn: section.innerDiameterIn,
    DriftIn: section.driftIn,
    Grade: section.grade,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Well Sections");
  XLSX.writeFile(workbook, `${well.name.replace(/\s+/g, "_")}_well.xlsx`);
};
```

- [ ] Create `src/components/well-builder/ExportMenu.tsx`:

```tsx
import Button from "../ui/Button";
import { WellDesign } from "../../types/well.types";
import { exportWellToExcel } from "../../utils/exportHelpers";

interface ExportMenuProps {
  well: WellDesign;
}

const ExportMenu = ({ well }: ExportMenuProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => exportWellToExcel(well)}>
        Export to Excel
      </Button>
    </div>
  );
};

export default ExportMenu;
```

##### Step 15 Verification Checklist

- [ ] Export a well and confirm the Excel file downloads.

#### Step 15 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 16: Form Validation & Error Handling

- [ ] Create `src/components/ui/ErrorMessage.tsx`:

```tsx
interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <p className="text-xs text-[var(--eq-danger)]">{message}</p>;
};

export default ErrorMessage;
```

- [ ] Create `src/components/ui/Toast.tsx`:

```tsx
interface ToastProps {
  message: string;
}

const Toast = ({ message }: ToastProps) => {
  return (
    <div className="fixed bottom-24 right-6 rounded-2xl bg-[var(--eq-text)] px-4 py-3 text-sm text-white">
      {message}
    </div>
  );
};

export default Toast;
```

##### Step 16 Verification Checklist

- [ ] Enter invalid values and confirm error messages appear.

#### Step 16 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 17: Responsive Design & Mobile Optimization

- [ ] Create `src/styles/responsive.css` with any additional responsive tweaks needed.

##### Step 17 Verification Checklist

- [ ] Confirm touch targets are at least 44×44px on mobile.

#### Step 17 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 18: Dark Mode Implementation

- [ ] Add theme persistence and system detection already handled in ThemeToggle.
- [ ] Adjust any component styles as needed for contrast.

##### Step 18 Verification Checklist

- [ ] Toggle dark mode on every page and confirm contrast is acceptable.

#### Step 18 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 19: Performance Optimization

- [ ] Create `src/utils/lazyLoad.ts` for route-based lazy loading when ready.

##### Step 19 Verification Checklist

- [ ] Confirm lazy-loaded routes render with a loading state.

#### Step 19 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 20: Documentation & Polish

- [ ] Create `README.md`, `docs/USER_GUIDE.md`, and `docs/CALCULATIONS.md` with full setup and usage guides.

##### Step 20 Verification Checklist

- [ ] Follow README instructions on a clean machine and confirm the app runs.

#### Step 20 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.
