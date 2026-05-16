"use client";

import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserEditDialog,
  type AdminPlan,
  type AdminUserRow,
} from "@/components/admin/user-edit-dialog";

export function UsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load users");
        }
        const data = await res.json();
        if (cancelled) return;
        setUsers(data.users ?? []);
        setPlans(data.plans ?? []);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load users");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const openEdit = (user: AdminUserRow) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleSaved = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-border/60 bg-white" />
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Credits</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/40 last:border-0"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {user.displayName ?? "—"}
                  </td>
                  <td className="px-4 py-3">{user.planName ?? "—"}</td>
                  <td className="px-4 py-3">{user.creditsBalance}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className={
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                          : undefined
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(user)}
                      className="gap-1.5"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No users found.
          </p>
        )}
      </div>

      {editingUser && (
        <UserEditDialog
          key={editingUser.id}
          user={editingUser}
          plans={plans}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
