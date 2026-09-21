import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Process and save an uploaded file.
 * Returns the public URL path of the saved file.
 */
export async function saveUploadedFile(file) {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: 5MB`);
  }

  // Ensure upload directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Generate unique filename with UUID
  const ext = getExtension(file.type);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Read file buffer and write
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // Return public URL path
  return `/uploads/${filename}`;
}

function getExtension(mimeType) {
  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[mimeType] || ".jpg";
}

/**
 * Delete an uploaded file by its public URL path
 */
export async function deleteUploadedFile(publicPath) {
  if (!publicPath) return;

  const filename = path.basename(publicPath);
  // Prevent path traversal
  if (filename.includes("..") || filename.includes("/")) {
    throw new Error("Invalid file path");
  }

  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    const { unlink } = await import("fs/promises");
    await unlink(filepath);
  } catch {
    // File may not exist, ignore
  }
}

