import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();

    // Get file extension
    const originalName = file.name;
    const ext = originalName.split('.').pop() || 'png';
    const filename = `${uuidv4()}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("audit-images")
      .upload(filename, bytes, {
        contentType: file.type || `image/${ext}`,
        upsert: false
      });

    if (error) {
      console.error("Supabase storage error:", error);
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("audit-images")
      .getPublicUrl(filename);

    // Return the URL
    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
