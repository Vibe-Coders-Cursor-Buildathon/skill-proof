import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth/session";
import { saveCourseRequestSchema } from "@/types/api";
import { handleApiError, unauthorized } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug query parameter required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ course: data });
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = saveCourseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slug, title, sourceType, sourceRef, language, difficulty, content } =
      parsed.data;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("courses")
      .insert({
        slug,
        title,
        source_type: sourceType,
        source_ref: sourceRef ?? null,
        language,
        difficulty,
        content,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ course: data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
