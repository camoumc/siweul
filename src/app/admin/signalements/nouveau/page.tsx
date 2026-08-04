import { redirect } from "next/navigation";

// L'admin est un utilisateur comme un autre : il utilise le même formulaire
// de création que tout le monde (/signaler). Une fois publié, il peut
// ensuite le réassigner à un autre utilisateur depuis la page d'édition
// admin (champ "Propriétaire (email)") si le signalement doit apparaître
// comme publié par quelqu'un d'autre.
export default function AdminNewReportRedirect() {
  redirect("/signaler");
}
