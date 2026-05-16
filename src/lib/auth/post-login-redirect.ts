import { isAdmin } from "@/lib/auth/role-guard";

export type PostLoginPath = "/admin" | "/dashboard";

export async function getDefaultPostLoginPath(
  userId: string,
): Promise<PostLoginPath> {
  return (await isAdmin(userId)) ? "/admin" : "/dashboard";
}
