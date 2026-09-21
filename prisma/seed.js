const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SmartDine database...");

  // 1. Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "SmartDine Restaurant",
      tagline: "Dine Smart, Dine Digital",
      logo: null,
    },
  });
  console.log("✅ Restaurant created:", restaurant.name);

  // 2. Tables (10 tables)
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { tableNumber: `Table ${i}` },
      update: {},
      create: {
        tableNumber: `Table ${i}`,
        active: true,
        restaurantId: restaurant.id,
      },
    });
  }
  console.log("✅ 10 tables created");

  // 3. Categories
  const categories = [
    { name: "Starters", description: "Begin your meal with these delicious appetizers", sortOrder: 1 },
    { name: "Main Course", description: "Hearty and fulfilling main dishes", sortOrder: 2 },
    { name: "Breads", description: "Freshly baked Indian breads", sortOrder: 3 },
    { name: "Beverages", description: "Refreshing drinks and beverages", sortOrder: 4 },
    { name: "Desserts", description: "Sweet endings to your meal", sortOrder: 5 },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { id: categories.indexOf(cat) + 1 },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }
  console.log("✅ 5 categories created");

  // 4. Dishes
  const dishes = [
    // Starters
    { name: "Paneer Tikka", description: "Marinated cottage cheese cubes grilled to perfection in a clay oven, served with mint chutney.", price: 280, categoryId: categoryMap["Starters"], isVeg: true },
    { name: "Veg Spring Rolls", description: "Crispy rolls stuffed with seasoned vegetables and glass noodles, served with sweet chili sauce.", price: 220, categoryId: categoryMap["Starters"], isVeg: true },
    { name: "Hara Bhara Kebab", description: "Delightful green kebabs made with spinach, peas, and potatoes, lightly spiced and pan-fried.", price: 200, categoryId: categoryMap["Starters"], isVeg: true },

    // Main Course
    { name: "Paneer Butter Masala", description: "Rich and creamy tomato-based curry with soft paneer cubes, finished with butter and cream.", price: 320, categoryId: categoryMap["Main Course"], isVeg: true },
    { name: "Dal Makhani", description: "Slow-cooked black lentils simmered overnight with butter, cream, and aromatic spices.", price: 260, categoryId: categoryMap["Main Course"], isVeg: true },
    { name: "Veg Biryani", description: "Fragrant basmati rice layered with mixed vegetables, saffron, and aromatic spices, served with raita.", price: 300, categoryId: categoryMap["Main Course"], isVeg: true },
    { name: "Palak Paneer", description: "Fresh spinach puree cooked with cottage cheese cubes and a blend of Indian spices.", price: 280, categoryId: categoryMap["Main Course"], isVeg: true },
    { name: "Chole Bhature", description: "Spicy chickpea curry served with fluffy deep-fried bread, a North Indian classic.", price: 240, categoryId: categoryMap["Main Course"], isVeg: true },

    // Breads
    { name: "Butter Naan", description: "Soft leavened bread baked in tandoor and brushed with melted butter.", price: 60, categoryId: categoryMap["Breads"], isVeg: true },
    { name: "Garlic Naan", description: "Tandoor-baked naan topped with fresh garlic and coriander.", price: 80, categoryId: categoryMap["Breads"], isVeg: true },
    { name: "Laccha Paratha", description: "Multi-layered flaky whole wheat paratha, crispy on the outside and soft inside.", price: 70, categoryId: categoryMap["Breads"], isVeg: true },

    // Beverages
    { name: "Masala Chai", description: "Authentic Indian spiced tea brewed with cardamom, ginger, and fresh milk.", price: 80, categoryId: categoryMap["Beverages"], isVeg: true },
    { name: "Mango Lassi", description: "Creamy yogurt smoothie blended with ripe Alphonso mangoes and a hint of cardamom.", price: 150, categoryId: categoryMap["Beverages"], isVeg: true },

    // Desserts
    { name: "Gulab Jamun", description: "Soft milk-solid dumplings soaked in warm rose-flavored sugar syrup, served warm.", price: 120, categoryId: categoryMap["Desserts"], isVeg: true },
    { name: "Rasmalai", description: "Delicate cottage cheese patties soaked in sweetened, cardamom-flavored milk topped with pistachios.", price: 150, categoryId: categoryMap["Desserts"], isVeg: true },
  ];

  for (const dish of dishes) {
    await prisma.dish.create({ data: dish });
  }
  console.log(`✅ ${dishes.length} dishes created`);

  // 5. Staff Users
  const adminHash = await bcrypt.hash("admin123", 12);
  const kitchenHash = await bcrypt.hash("1234", 12);
  const stewardHash = await bcrypt.hash("1234", 12);

  const staffUsers = [
    { name: "Admin", role: "admin", passwordHash: adminHash, restaurantId: restaurant.id },
    { name: "Kitchen", role: "kitchen", passwordHash: kitchenHash, restaurantId: restaurant.id },
    { name: "Steward", role: "steward", passwordHash: stewardHash, restaurantId: restaurant.id },
  ];

  for (const staff of staffUsers) {
    await prisma.staffUser.upsert({
      where: { name_role: { name: staff.name, role: staff.role } },
      update: {},
      create: staff,
    });
  }
  console.log("✅ 3 staff users created (Admin/admin123, Kitchen/1234, Steward/1234)");

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
