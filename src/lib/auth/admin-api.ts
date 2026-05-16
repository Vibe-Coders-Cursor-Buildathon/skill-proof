import { getUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/role-guard";
import { forbidden, unauthorized } from "@/lib/api/errors";

export async function requireAdminUser() {
  const user = await getUser();
  if (!user) {
    return { user: null, error: unauthorized() };
  }
  try {
    await requireAdmin(user.id);
  } catch {
    return { user: null, error: forbidden("Admin access required") };
  }
  return { user, error: null };
}
