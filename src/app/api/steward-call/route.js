import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";
import { requireAuth } from "@/lib/auth";

// POST - Customer calls steward (public, no login)
export async function POST(request) {
  try {
    const { tableId, message } = await request.json();

    if (!tableId) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId, 10) },
    });

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    const call = await prisma.stewardCall.create({
      data: {
        tableId: table.id,
        message: message?.trim() || null,
        status: "PENDING",
      },
      include: {
        table: { select: { tableNumber: true } },
      },
    });

    // Notify steward via SSE
    emitSSE("steward", {
      type: "STEWARD_CALL",
      callId: call.id,
      tableId: table.id,
      tableNumber: table.tableNumber,
      message: call.message,
      createdAt: call.createdAt,
    });

    return NextResponse.json({ call }, { status: 201 });
  } catch (error) {
    console.error("Steward call error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET - Get pending steward calls (steward or admin only)
export async function GET() {
  try {
    const auth = await requireAuth(["admin", "steward"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const calls = await prisma.stewardCall.findMany({
      include: { table: { select: { id: true, tableNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ calls });
  } catch (error) {
    console.error("Steward calls fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Acknowledge a steward call (steward or admin only)
export async function PATCH(request) {
  try {
    const auth = await requireAuth(["admin", "steward"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { callId } = await request.json();

    if (!callId) {
      return NextResponse.json({ error: "callId is required" }, { status: 400 });
    }

    const call = await prisma.stewardCall.update({
      where: { id: parseInt(callId, 10) },
      data: {
        status: "ACKNOWLEDGED",
        acknowledgedAt: new Date(),
      },
    });

    return NextResponse.json({ call });
  } catch (error) {
    console.error("Steward call acknowledge error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

