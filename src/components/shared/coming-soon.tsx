import { Badge } from "@/components/ui/badge";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Badge variant="secondary">Coming soon</Badge>
      <p className="text-muted-foreground">
        {feature} will be implemented in Phase 1.
      </p>
    </div>
  );
}
