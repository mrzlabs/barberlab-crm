"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navStyles } from "@/components/layout/nav-config";

type NavItem = { href: string; label: string };

export function BottomTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-[54px] left-0 right-0 z-30 overflow-x-auto bg-white/76 pb-[env(safe-area-inset-bottom)] shadow-[0_-18px_50px_rgba(15,23,42,.12)] backdrop-blur-2xl dark:bg-slate-950/76 lg:hidden"
    >
      <div className="flex h-16 min-w-max items-center gap-1 px-2">
        {items.map((item) => {
          const style = navStyles[item.label] ?? navStyles.Dashboard;
          const Icon = style.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-[74px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5"
            >
              <span
                className={`grid size-10 place-items-center rounded-2xl transition-all duration-150 ${
                  isActive ? `${style.tone} scale-105 shadow-lg` : "bg-slate-950/5 text-slate-500 dark:bg-white/8 dark:text-white/50"
                } ${isActive ? style.shape === "circle" ? "rounded-full" : style.shape === "square" ? "rounded-xl" : "rounded-[14px]" : ""}`}
              >
                <Icon className={`size-5 ${isActive ? "fill-current" : ""}`} />
              </span>
              <span className={`max-w-[68px] truncate text-[9px] font-bold ${isActive ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-white/45"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
