import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { PrismaClient } from "../../backend/src/generated/prisma/client.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
 * The seed file lives outside backend/node_modules.
 * Create a require function anchored at backend/package.json
 * so all backend dependencies resolve from backend/node_modules.
 */
const backendRequire = createRequire(
  path.resolve(__dirname, "../../backend/package.json"),
);

const dotenv = backendRequire("dotenv");
const bcrypt = backendRequire("bcryptjs");
const { PrismaPg } = backendRequire("@prisma/adapter-pg");

dotenv.config({
  path: path.resolve(__dirname, "../../backend/.env"),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from backend/.env");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting ARTISAN AI database seed...");

  const artisanPasswordHash = await bcrypt.hash("Artisan@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);

  console.log("🧹 Clearing existing demo data...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.aIGeneration.deleteMany();
  await prisma.product.deleteMany();
  await prisma.artisan.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating demo users...");

  const artisanUser = await prisma.user.create({
    data: {
      name: "Ramesh Kumar",
      phone: "9000000001",
      passwordHash: artisanPasswordHash,
      role: "ARTISAN",
      language: "hi",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: "Ananya Sharma",
      phone: "9000000002",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      language: "en",
    },
  });

  await prisma.user.create({
    data: {
      name: "Dr. Vikram Mehta",
      phone: "9000000003",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      language: "en",
    },
  });

  console.log("🎨 Creating artisan profile...");

  const artisan = await prisma.artisan.create({
    data: {
      userId: artisanUser.id,
      craftType: "Handcrafted Terracotta",
      city: "Khurja",
      state: "Uttar Pradesh",
      latitude: 28.2539,
      longitude: 77.851,
      story:
        "Ramesh Kumar is a traditional artisan creating handcrafted terracotta products using techniques passed down through generations.",
    },
  });

  console.log("🛍️ Creating demo products...");

  const diya = await prisma.product.create({
    data: {
      artisanId: artisan.id,
      title: "Handcrafted Terracotta Diya Set",
      description:
        "Traditional hand-shaped terracotta diyas suitable for festivals, home decoration, and gifting.",
      category: "Home Decor",
      material: "Terracotta",
      price: 499,
      currency: "INR",
      imageUrl:
        "https://images.unsplash.com/photo-1603006905003-be475563bc59",
      city: "Khurja",
      state: "Uttar Pradesh",
      productionTimeDays: 5,
      status: "PUBLISHED",
    },
  });

  const vase = await prisma.product.create({
    data: {
      artisanId: artisan.id,
      title: "Traditional Terracotta Vase",
      description:
        "Handcrafted terracotta vase featuring traditional Indian patterns and natural finishing.",
      category: "Home Decor",
      material: "Terracotta",
      price: 1299,
      currency: "INR",
      imageUrl:
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c",
      city: "Khurja",
      state: "Uttar Pradesh",
      productionTimeDays: 7,
      status: "PUBLISHED",
    },
  });

  const lamp = await prisma.product.create({
    data: {
      artisanId: artisan.id,
      title: "Decorative Terracotta Lamp",
      description:
        "Handmade terracotta decorative lamp designed for warm traditional interiors.",
      category: "Lighting",
      material: "Terracotta",
      price: 1799,
      currency: "INR",
      imageUrl:
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
      city: "Khurja",
      state: "Uttar Pradesh",
      productionTimeDays: 10,
      status: "DRAFT",
    },
  });

  console.log("⭐ Creating demo review...");

  await prisma.review.create({
    data: {
      productId: diya.id,
      userId: customerUser.id,
      rating: 5,
      comment:
        "Beautiful handcrafted diyas with excellent traditional finishing.",
    },
  });

  console.log("📦 Creating demo order...");

  const totalAmount = diya.price * 2 + vase.price;

  const order = await prisma.order.create({
    data: {
      customerId: customerUser.id,
      customerName: customerUser.name,
      phone: customerUser.phone,
      address: "Civil Lines, Prayagraj, Uttar Pradesh",
      status: "PLACED",
      totalAmount,
      items: {
        create: [
          {
            productId: diya.id,
            quantity: 2,
            unitPrice: diya.price,
          },
          {
            productId: vase.id,
            quantity: 1,
            unitPrice: vase.price,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  console.log("🤖 Creating demo AI generation record...");

  await prisma.aIGeneration.create({
    data: {
      artisanId: artisan.id,
      productId: lamp.id,
      userId: artisanUser.id,
      type: "GENERATE_PRODUCT",
      inputText:
        "Create a traditional terracotta decorative lamp for an Indian artisan marketplace.",
      outputJson: {
        title: lamp.title,
        description: lamp.description,
        category: lamp.category,
        material: lamp.material,
        suggestedPrice: 1799,
      },
      status: "SUCCESS",
    },
  });

  console.log("");
  console.log("========================================");
  console.log("     ARTISAN AI SEED SUCCESSFUL");
  console.log("========================================");
  console.log("Users       : 3");
  console.log("Artisans    : 1");
  console.log("Products    : 3");
  console.log("Reviews     : 1");
  console.log("Orders      : 1");
  console.log(`Order Items : ${order.items.length}`);
  console.log("AI Records  : 1");
  console.log("========================================");
  console.log("");
  console.log("Demo credentials:");
  console.log("ARTISAN  : 9000000001 / Artisan@123");
  console.log("CUSTOMER : 9000000002 / Customer@123");
  console.log("ADMIN    : 9000000003 / Admin@123");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Database seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });