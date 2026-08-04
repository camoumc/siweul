import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { LayoutDashboard, Users, FileWarning, ArrowLeftCircle, Tag, ShieldAlert } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/admin");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/");

  const navItems = [
    { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/admin/signalements", label: "Signalements", icon: FileWarning },
    { href: "/admin/moderation", label: "Modération (abus)", icon: ShieldAlert },
    { href: "/admin/tarifs", label: "Grille tarifaire", icon: Tag },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  ];

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24 rounded-2xl border border-border bg-white p-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text hover:bg-paper-2"
              >
                <item.icon size={16} /> {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-text-muted hover:bg-paper-2"
          >
            <ArrowLeftCircle size={16} /> Retour au site
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
