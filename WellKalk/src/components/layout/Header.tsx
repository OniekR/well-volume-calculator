import { Droplets } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
  return (
    <header className="border-b border-[var(--eq-border)] bg-[var(--eq-surface-strong)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--eq-primary)] text-white">
            <Droplets size={18} />
          </div>
          <div className="text-sm font-semibold">Well Calculator</div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
