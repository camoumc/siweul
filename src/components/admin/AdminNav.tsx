"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileWarning,
  ArrowLeftCircle,
  Tag,
  ShieldAlert,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  FileWarning,
  Tag,
  ShieldAlert,
  CreditCard,
};

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

export default function AdminNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile / tablette : barre horizontale scrollable, toujours visible */}
      <nav className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-2 md:hidden">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium whitespace-nowrap ${
                active
                  ? "border-signal bg-signal text-white"
                  : "border-border bg-white text-text"
              }`}
            >
              <Icon size={13} /> {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop : sidebar verticale fixe */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-white p-3">
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    active ? "bg-signal/10 text-signal" : "text-text hover:bg-paper-2"
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-paper-2"
          >
            <ArrowLeftCircle size={16} /> Retour au site
          </Link>
        </div>
      </aside>
    </>
  );
}
