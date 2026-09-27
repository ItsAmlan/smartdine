import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Analytics data (admin only)
export async function GET(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    // Today's orders
    const todayOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["PENDING", "PAYMENT_FAILED"] },
      },
      include: {
        items: { include: { dish: true } },
        customer: { select: { name: true, email: true } },
        table: { select: { tableNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Total revenue
    const totalRevenue = todayOrders.reduce(
      (sum, order) => sum + parseFloat(order.totalAmount),
      0
    );

    // Order count
    const orderCount = todayOrders.length;

    // Average order value
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Most popular dishes
    const dishCounts = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const dishName = item.dish.name;
        if (!dishCounts[dishName]) {
          dishCounts[dishName] = { name: dishName, count: 0, revenue: 0 };
        }
        dishCounts[dishName].count += item.quantity;
        dishCounts[dishName].revenue += parseFloat(item.subtotal);
      });
    });

    const popularDishes = Object.values(dishCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Orders by hour
    const ordersByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0,
    }));
    todayOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      ordersByHour[hour].count++;
    });

    // Total customers today
    const uniqueCustomers = new Set(todayOrders.map((o) => o.customer.email)).size;

    return NextResponse.json({
      date: dateStr,
      orderCount,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      uniqueCustomers,
      popularDishes,
      ordersByHour,
      recentOrders: todayOrders.slice(0, 20),
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

