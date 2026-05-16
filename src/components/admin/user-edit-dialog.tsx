"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileRole } from "@/types/plan";

export type AdminPlan = { id: string; slug: string; name: string };

export type AdminUserRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  creditsBalance: number;
  role: ProfileRole;
  planId: string;
  planName: string | null;
};

type UserEditDialogProps = {
  user: AdminUserRow;
  plans: AdminPlan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

export function UserEditDialog({
  user,
  plans,
  open,
  onOpenChange,
  onSaved,
}: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <UserEditForm
          key={user.id}
          user={user}
          plans={plans}
          onSaved={onSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function UserEditForm({
  user,
  plans,
  onSaved,
  onCancel,
}: {
  user: AdminUserRow;
  plans: AdminPlan[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [role, setRole] = useState<ProfileRole>(user.role);
  const [planId, setPlanId] = useState(user.planId);
  const [creditsBalance, setCreditsBalance] = useState(String(user.creditsBalance));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const balance = parseInt(creditsBalance, 10);
    if (Number.isNaN(balance) || balance < 0) {
      setError("Credits must be a non-negative number");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          plan_id: planId,
          credits_balance: balance,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update user");
      }

      onSaved();
      onCancel();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription>
          {user.email ?? user.displayName ?? "User"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Role</label>
          <Select
            value={role}
            onValueChange={(v) => v && setRole(v as ProfileRole)}
          >
            <SelectTrigger className="h-11 w-full rounded-2xl bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Plan</label>
          <Select value={planId} onValueChange={(v) => v && setPlanId(v)}>
            <SelectTrigger className="h-11 w-full rounded-2xl bg-white">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Credits balance</label>
          <Input
            type="number"
            min={0}
            value={creditsBalance}
            onChange={(e) => setCreditsBalance(e.target.value)}
            className="h-11 rounded-2xl"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="btn-gradient"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
