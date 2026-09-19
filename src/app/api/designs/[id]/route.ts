import { NextResponse } from "next/server";
import { removeCollectionFiles, writeCollectionFiles } from "@/lib/export-collection";
import { UUID_RE } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { DesignDna } from "@/types/design";

type UpdateBody = {
  userId?: string;
  name?: string;
  dna?: DesignDna;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = new URL(request.url).searchParams.get("userId")?.trim();
    if (!userId || !UUID_RE.test(userId) || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "A valid id is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("design_dnas")
      .select("id, user_id, name, prompt, moodboard_title, moodboard_image_url, dna, created_at")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    return NextResponse.json({ design: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load design.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateBody;
    const userId = body.userId?.trim();
    const name = body.name?.trim();
    const dna = body.dna;

    if (!userId || !UUID_RE.test(userId) || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "A valid id is required." }, { status: 400 });
    }
    if (!name || !dna) {
      return NextResponse.json({ error: "Name and design DNA are required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from("design_dnas")
      .select("prompt, moodboard_title")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (existingError || !existing) {
      throw new Error(existingError?.message ?? "Design not found.");
    }

    const { data, error } = await supabase
      .from("design_dnas")
      .update({ name, dna })
      .eq("id", id)
      .eq("user_id", userId)
      .select("id, name")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Design not found.");
    }

    const slug = await writeCollectionFiles({
      name,
      prompt: existing.prompt,
      moodboardTitle: existing.moodboard_title,
      dna,
    }).catch(() => null);

    return NextResponse.json({ id: data.id, name: data.name, slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update design.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = new URL(request.url).searchParams.get("userId")?.trim();
    if (!userId || !UUID_RE.test(userId) || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "A valid id is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: existing, error: existingError } = await supabase
      .from("design_dnas")
      .select("name")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (existingError || !existing) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    const { error } = await supabase
      .from("design_dnas")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    const slug = await removeCollectionFiles(existing.name).catch(() => null);
    return NextResponse.json({ id, slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete design.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
