import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/admin");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) redirect("/");

  const navItems = [
    { href: "/admin", label: "Vue d'ensemble", icon: "LayoutDashboard" as const },
    { href: "/admin/signalements", label: "Signalements", icon: "FileWarning" as const },
    { href: "/admin/moderation", label: "Modération (abus)", icon: "ShieldAlert" as const },
    { href: "/admin/paiements", label: "Paiements", icon: "CreditCard" as const },
    { href: "/admin/ambassadeurs", label: "Ambassadeurs", icon: "Megaphone" as const },
    { href: "/admin/tarifs", label: "Grille tarifaire", icon: "Tag" as const },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "Users" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl gap-8 px-4 py-6 sm:px-6 sm:py-10 md:flex">
      <AdminNav items={navItems} />
      <div className="mt-4 min-w-0 flex-1 md:mt-0">{children}</div>
    </div>
  );
}
