export const PUBLISH_STATUSES = [
  "draft",
  "pending",
  "approved",
  "rejected",
] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

/** Slots counting toward plan limit (pending review + live). */
export const PUBLISH_SLOT_STATUSES: PublishStatus[] = ["pending", "approved"];

export function publishStatusLabel(status: PublishStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending":
      return "Pending review";
    case "approved":
      return "Published";
    case "rejected":
      return "Rejected";
  }
}
