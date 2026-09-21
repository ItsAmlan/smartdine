import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/upload";

// POST - Upload image
export async function POST(request) {
  try {
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

