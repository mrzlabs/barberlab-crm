"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navStyles } from "@/components/layout/nav-config";

type NavItem = { href: string; label: string };

export function BottomTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed left-0 right-0 top-[52px] z-30 overflow-x-auto border-b border-white/8 bg-slate-950/88 pb-0 shadow-[0_4px_24px_rgba(0,0,0,0.32)] backdrop-blur-2xl lg:hidden"
    >
      <div className="flex h-14 min-w-max items-center gap-0.5 px-2">
        {items.map((item) => {
          const style = navStyles[item.label] ?? navStyles.Dashboard;
          const Icon = style.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-1.5 py-1"
            >
              <span
                className={`grid size-9 place-items-center rounded-xl transition-all duration-150 ${
                  isActive
                    ? `${style.tone} scale-105 shadow-lg`
                    : "bg-white/5 text-white/45"
                } ${isActive ? style.shape === "circle" ? "rounded-full" : "rounded-xl" : ""}`}
              >
                <Icon className={`size-4.5 ${isActive ? "fill-current" : ""}`} />
              </span>
              <span className={`max-w-[60px] truncate text-[8px] font-bold ${isActive ? "text-white" : "text-white/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
