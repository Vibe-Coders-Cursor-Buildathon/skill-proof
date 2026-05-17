import { NextResponse } from "next/server";
import { z } from "zod";

import {
  handleApiError,
  unauthorized,
  forbidden,
} from "@/lib/api/errors";
import { getUser } from "@/lib/auth/session";
import { getEffectiveCourseContent } from "@/lib/courses/get-effective-content";
import { resolveCourseAccess } from "@/lib/courses/course-access";
import { getCourseCertificateConfig } from "@/lib/certificates/course-certificate-config";
import { CERTIFICATE_PASS_PERCENT } from "@/lib/certificates/constants";
import { issueCertificate } from "@/lib/certificates/issue-certificate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const postSchema = z.object({
  quiz_score_percent: z.number().int().min(0).max(100),
});

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const { slug } = await context.params;
    const supabase = await createSupabaseServerClient();

    const { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const { data: certificate, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ certificate: null });
      }
      throw error;
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const { slug } = await context.params;
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.quiz_score_percent < CERTIFICATE_PASS_PERCENT) {
      return NextResponse.json(
        {
          error: `Score at least ${CERTIFICATE_PASS_PERCENT}% on the quiz to earn your certificate.`,
        },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: course } = await supabase
      .from("courses")
      .select(
        "id, slug, user_id, is_published, certificates_enabled, content, content_edited, price_cents, publish_status",
      )
      .eq("slug", slug)
      .single();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const access = await resolveCourseAccess({
      supabase,
      userId: user.id,
      course,
    });

    if (!access.hasFullAccess) {
      return forbidden("Complete the course with full access to earn a certificate.");
    }

    const effective = getEffectiveCourseContent(course.content, course.content_edited);
    if (!effective) {
      return NextResponse.json({ error: "Invalid course content" }, { status: 400 });
    }

    const certConfig = await getCourseCertificateConfig(
      supabase,
      course.id,
      course.slug,
      effective.title,
      course.certificates_enabled === true,
      course.user_id,
    );

    if (!certConfig?.enabled) {
      return NextResponse.json(
        { error: "This course does not offer certificates." },
        { status: 400 },
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const learnerName =
      profile?.display_name?.trim() ||
      user.email?.split("@")[0] ||
      "Learner";

    const result = await issueCertificate({
      userId: user.id,
      learnerName,
      courseId: course.id,
      courseTitle: effective.title,
      quizScorePercent: parsed.data.quiz_score_percent,
      publisherUserId: course.user_id,
      publisherBrandName: certConfig.publisherBrandName,
      publisherLogoUrl: certConfig.publisherLogoUrl,
    });

    return NextResponse.json({
      certificate: result.certificate,
      created: result.created,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
