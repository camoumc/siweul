import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AccountSettingsForm from "@/components/AccountSettingsForm";
import { Settings } from "lucide-react";

export default async function ParametresPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/parametres");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/connexion");

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="mb-8 flex items-center gap-2">
        <Settings className="text-signal" size={24} />
        <h1 className="font-display text-2xl font-semibold text-text">Paramètres du compte</h1>
      </div>
      <AccountSettingsForm
        initialName={user.name}
        initialPhone={user.phone ?? ""}
        initialCity={user.city ?? ""}
      />
    </div>
  );
}
