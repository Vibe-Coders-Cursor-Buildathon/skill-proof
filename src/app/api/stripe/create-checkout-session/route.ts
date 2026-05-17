import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getCreditPurchaseQuote,
  isValidCreditPurchaseAmount,
} from "@/config/credit-purchase";
import { isPricingPlanId } from "@/config/pricing";
import { isPaidPricingPlanId } from "@/config/stripe-plans";
import { handleApiError, unauthorized } from "@/lib/api/errors";
import { requireFeature } from "@/lib/auth/plan-guard";
import { getUser } from "@/lib/auth/session";
import { isPaidPublicCourse } from "@/config/course-pricing";
import {
  createStripeCheckoutSession,
  createStripeCourseCheckoutSession,
  createStripeCreditsCheckoutSession,
} from "@/lib/stripe/create-checkout-session";
import { userPurchasedCourse } from "@/lib/courses/course-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/stripe/server";

const bodySchema = z.union([
  z.object({ planId: z.string() }),
  z.object({ credits: z.number().int() }),
]);

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local (test key: sk_test_…).",
        },
        { status: 503 },
      );
    }

    const user = await getUser();
    if (!user?.email) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const origin = new URL(request.url).origin;

    if ("courseSlug" in parsed.data) {
      const supabase = await createSupabaseServerClient();
      const { data: course } = await supabase
        .from("courses")
        .select("id, slug, title, user_id, is_published, price_cents, publish_status")
        .eq("slug", parsed.data.courseSlug)
        .single();

      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      if (!course.is_published) {
        return NextResponse.json(
          { error: "This course is not available for purchase" },
          { status: 400 },
        );
      }

      if (course.user_id === user.id) {
        return NextResponse.json(
          { error: "You already own this course" },
          { status: 400 },
        );
      }

      const priceCents = course.price_cents ?? 0;
      if (!isPaidPublicCourse(priceCents)) {
        return NextResponse.json(
          { error: "This course is free — no purchase needed" },
          { status: 400 },
        );
      }

      const alreadyOwns = await userPurchasedCourse(
        supabase,
        user.id,
        course.id,
      );
      if (alreadyOwns) {
        return NextResponse.json(
          { error: "You already purchased this course" },
          { status: 400 },
        );
      }

      const session = await createStripeCourseCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        priceCents,
        origin,
      });

      return NextResponse.json({ url: session.url });
    }

    if ("credits" in parsed.data) {
      const { credits } = parsed.data;
      if (!isValidCreditPurchaseAmount(credits)) {
        return NextResponse.json(
          { error: "Minimum purchase is 5 credits" },
          { status: 400 },
        );
      }

      await requireFeature(user.id, "can_purchase_credits");

      getCreditPurchaseQuote(credits);

      const session = await createStripeCreditsCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        credits,
        origin,
      });

      return NextResponse.json({ url: session.url });
    }

    const { planId } = parsed.data;
    if (!isPricingPlanId(planId) || !isPaidPricingPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid or unpaid plan" },
        { status: 400 },
      );
    }

    const session = await createStripeCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      pricingPlanId: planId,
      origin,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
