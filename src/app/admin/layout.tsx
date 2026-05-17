import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { PageShell } from "@/components/layout/page-shell";
import { getUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/role-guard";

export const metadata = {
  title: "Admin | SkillProof",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/?auth=signin&redirect=/admin");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/dashboard");
  }

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, courses, and platform stats
        </p>
      </div>
      <AdminNav />
      {children}
    </PageShell>
  );
}
