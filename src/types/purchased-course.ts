import type { CourseRecord } from "@/types/course";

export type PurchasedCourse = {
  purchaseId: string;
  purchasedAt: string;
  purchasePriceCents: number;
  course: CourseRecord;
};
