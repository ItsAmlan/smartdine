import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";
import { requireAuth } from "@/lib/auth";

// POST - Upload image (admin only)
export async function POST(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const publicPath = await saveUploadedFile(file);

    return NextResponse.json(
      { url: publicPath },
      {
        status: 201,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    if (error.message.includes("Invalid file type") || error.message.includes("File too large")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

