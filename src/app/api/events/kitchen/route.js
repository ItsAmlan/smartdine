import { createSSEResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET() {
  return createSSEResponse("kitchen");
}
