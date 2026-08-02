import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return null;
  }
  return session;
}
