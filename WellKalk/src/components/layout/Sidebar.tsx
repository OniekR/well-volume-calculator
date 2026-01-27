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
              `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-[var(--eq-primary)] text-white"
                  : "text-[var(--eq-text-muted)] hover:bg-[var(--eq-border)]"
              }`
            }
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
    </aside>
  );
};

export default Sidebar;
