import { redirect } from "next/navigation";

import { getDefaultPostLoginPath } from "@/lib/auth/post-login-redirect";
import { getUser } from "@/lib/auth/session";

export default async function AfterLoginPage() {
  const user = await getUser();
  if (!user) {
    redirect("/?auth=signin");
  }

  redirect(await getDefaultPostLoginPath(user.id));
}
