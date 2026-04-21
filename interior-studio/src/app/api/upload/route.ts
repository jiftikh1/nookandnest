import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_BUCKETS = ["room-photos", "mood-boards", "references", "ideas"];

async function ensureBucketExists(bucket: string) {
  // Try to create it — silently ignore "already exists" errors
  await supabaseAdmin.storage
    .createBucket(bucket, { public: true, allowedMimeTypes: ["image/*"] })
    .catch(() => {});
  // Always try to ensure it's set to public (handles pre-existing private buckets)
  await supabaseAdmin.storage
    .updateBucket(bucket, { public: true })
    .catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated first
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "mood-boards";
    const folder = formData.get("folder") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    // Ensure the bucket exists and is public before uploading
    await ensureBucketExists(bucket);

    const ext = file.name.split(".").pop();
    const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileName = folder ? `${folder}/${uniquePart}` : uniquePart;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
