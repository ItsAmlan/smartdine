import { NextResponse } from "next/server";
import { createSSEResponse } from "@/lib/sse";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth(["admin", "steward"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return createSSEResponse("steward");
}
