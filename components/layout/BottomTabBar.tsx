"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navStyles } from "@/components/layout/nav-config";

type NavItem = { href: string; label: string };

export function BottomTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const visible = items.slice(0, 5);

  return (
    <nav
      className="fixed bottom-14 left-0 right-0 z-30 border-t border-white/10 backdrop-blur-2xl lg:hidden"
      style={{ background: "rgba(var(--brand-primary-rgb,17,24,39),0.92)" }}
    >
      <div className="flex h-14 items-center justify-around px-1">
        {visible.map((item) => {
          const style = navStyles[item.label] ?? navStyles.Dashboard;
          const Icon = style.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <span
                className={`grid size-9 place-items-center rounded-xl transition-all duration-150 ${
                  isActive ? `${style.tone} shadow-lg scale-110` : "text-white/50"
                } ${isActive ? style.shape === "circle" ? "rounded-full" : style.shape === "square" ? "rounded-xl" : "rounded-[14px]" : ""}`}
              >
                <Icon className="size-[17px]" />
              </span>
              <span className={`truncate text-[9px] font-bold ${isActive ? "text-white" : "text-white/40"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
