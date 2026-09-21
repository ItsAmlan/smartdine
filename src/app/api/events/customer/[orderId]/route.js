import { createSSEResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { orderId } = await params;
  return createSSEResponse(`customer-${orderId}`);
}
