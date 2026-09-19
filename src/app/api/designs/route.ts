import { NextResponse } from "next/server";
import { writeCollectionFiles } from "@/lib/export-collection";
import { UUID_RE } from "@/lib/ids";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { DesignDna } from "@/types/design";

type SaveBody = {
  userId?: string;
  name?: string;
  prompt?: string;
  moodboardTitle?: string;
  moodboardImageUrl?: string;
  dna?: DesignDna;
};

export async function GET(request: Request) {
  try {
    const userId = new URL(request.url).searchParams.get("userId")?.trim();
    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "A valid user id is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("design_dnas")
      .select("id, user_id, name, prompt, moodboard_title, moodboard_image_url, dna, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ designs: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load designs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaveBody;
    const userId = body.userId?.trim();
    const name = body.name?.trim();
    const prompt = body.prompt?.trim();
    const moodboardTitle = body.moodboardTitle?.trim();
    const moodboardImageUrl = body.moodboardImageUrl?.trim() ?? null;
    const dna = body.dna;

    if (!userId || !UUID_RE.test(userId)) {
      return NextResponse.json({ error: "A valid user id is required." }, { status: 400 });
    }
    if (!name || !prompt || !moodboardTitle || !dna) {
      return NextResponse.json({ error: "Name the design and finish the last step first." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error: userError } = await supabase.from("users").upsert({ id: userId });
    if (userError) {
      throw new Error(userError.message);
    }

    const { data, error } = await supabase
      .from("design_dnas")
      .insert({
        user_id: userId,
        name,
        prompt,
        moodboard_title: moodboardTitle,
        moodboard_image_url: moodboardImageUrl,
        dna,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const slug = await writeCollectionFiles({
      name,
      prompt,
      moodboardTitle,
      dna,
    }).catch(() => null);

    return NextResponse.json({ id: data.id, userId, name, slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save design DNA.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
