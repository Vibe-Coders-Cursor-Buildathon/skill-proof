type PgError = { code?: string; message?: string };

export function isMissingColumnError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as PgError).code === "42703"
  );
}

export function getPostgresErrorMessage(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as PgError).message);
  }
  return null;
}

export function schemaOutdatedResponse(feature: string) {
  return {
    error: `${feature} requires a database update. In Supabase → SQL Editor, run migrations 00011_publish_approval.sql and 00012_course_pricing.sql from the supabase/migrations folder, then try again.`,
    code: "schema_outdated" as const,
  };
}
