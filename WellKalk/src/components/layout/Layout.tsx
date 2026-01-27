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