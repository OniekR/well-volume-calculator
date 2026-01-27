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
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
