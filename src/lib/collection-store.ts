import { collectionSlug } from "@/lib/export-collection";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { DesignDna, SavedDesign } from "@/types/design";

export type CollectionRow = Pick<
  SavedDesign,
  "id" | "name" | "prompt" | "moodboard_title" | "dna"
>;

export async function listUserCollections(userId: string): Promise<CollectionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("design_dnas")
    .select("id, name, prompt, moodboard_title, dna")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CollectionRow[];
}

export function matchCollection(designs: CollectionRow[], name: string) {
  const needle = collectionSlug(name);
  return designs.find((design) => {
    const slug = collectionSlug(design.name);
    return (
      slug === needle ||
      design.name.toLowerCase() === name.trim().toLowerCase() ||
      slug.includes(needle) ||
      needle.includes(slug)
    );
  });
}

export function isDesignDna(value: unknown): value is DesignDna {
  if (!value || typeof value !== "object") return false;
  const dna = value as DesignDna;
  return Boolean(dna.palette && dna.type);
}
