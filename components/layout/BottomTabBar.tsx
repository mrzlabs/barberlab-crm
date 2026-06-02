"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function BottomTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="overflow-x-auto lg:hidden"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex h-9 min-w-max items-end gap-0 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap px-3 pb-1.5 pt-1 text-[11px] font-semibold transition-colors"
              style={{
                color: isActive ? "#00cec9" : "rgba(255,255,255,0.45)",
                borderBottom: isActive ? "2px solid #00cec9" : "2px solid transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
