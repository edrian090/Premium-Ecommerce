const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("----------------------------------------");
  console.log("🧹 Step 1: Cleaning up existing database products & dependencies...");
  console.log("----------------------------------------");

  try {
    const deleteCartItems = await prisma.cartItem.deleteMany({});
    console.log(`Deleted ${deleteCartItems.count} cart items.`);
    
    const deleteWishlistProducts = await prisma.wishlistProduct.deleteMany({});
    console.log(`Deleted ${deleteWishlistProducts.count} wishlist products.`);
    
    const deleteOrderItems = await prisma.orderItem.deleteMany({});
    console.log(`Deleted ${deleteOrderItems.count} order items.`);
    
    const deleteOrders = await prisma.order.deleteMany({});
    console.log(`Deleted ${deleteOrders.count} orders.`);
    
    const deleteReviews = await prisma.review.deleteMany({});
    console.log(`Deleted ${deleteReviews.count} reviews.`);
    
    const deleteProducts = await prisma.product.deleteMany({});
    console.log(`Deleted ${deleteProducts.count} products.`);
    
    const deleteCategories = await prisma.category.deleteMany({});
    console.log(`Deleted ${deleteCategories.count} categories.`);
    
    console.log("✨ Database cleanup successfully completed!");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error;
  }

  console.log("\n----------------------------------------");
  console.log("👗 Step 2: Seeding premium clothing categories & products...");
  console.log("----------------------------------------");

  const categoriesData = [
    { name: "Men's Clothing", description: "Premium, tailored wardrobe staples for men." },
    { name: "Women's Clothing", description: "Elegant, high-quality, and modern styles for women." },
    { name: "Premium Footwear", description: "Handcrafted, comfortable, and durable boots and shoes." },
    { name: "Luxury Accessories", description: "Exquisite details to complete your premium look." }
  ];

  const categories = {};
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
    console.log(`Created category: "${cat.name}"`);
  }

  const productsData = [
    // --- Men's Clothing ---
    {
      category: "Men's Clothing",
      name: "Classic Oxford Cotton Shirt",
      description: "Crafted from 100% long-staple premium cotton, this shirt offers a relaxed yet sharp tailored silhouette, perfect for smart-casual dressing.",
      price: 68.00,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 10,
      stock: 45
    },
    {
      category: "Men's Clothing",
      name: "Sleek Hooded Bomber Jacket",
      description: "A modern street-smart staple featuring water-resistant shell coating, soft insulated lining, and premium metal zippers.",
      price: 119.00,
      images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 30
    },
    {
      category: "Men's Clothing",
      name: "Slim Fit Stretch Chino Pants",
      description: "Super soft satin-finish cotton chino with just enough elastane stretch. Perfectly comfortable for office-to-dinner transitions.",
      price: 59.00,
      images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 60
    },
    {
      category: "Men's Clothing",
      name: "Tailored Wool Tweed Blazer",
      description: "Timeless tweed pattern blazer woven from premium lamb's wool blend. Features custom tortoise-shell buttons and double vents.",
      price: 189.00,
      images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 15,
      stock: 18
    },
    {
      category: "Men's Clothing",
      name: "Vintage Denim Trucker Jacket",
      description: "Heavyweight organic denim jacket in a beautiful washed indigo. Features button closure, chest pockets, and adjustable waist tabs.",
      price: 85.00,
      images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 25
    },
    {
      category: "Men's Clothing",
      name: "Premium Merino Wool Sweater",
      description: "Ultra-fine, breathable merino wool crewneck. Incredibly soft, naturally odor-resistant, and perfect for lightweight layering.",
      price: 79.00,
      images: ["https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 5,
      stock: 40
    },
    {
      category: "Men's Clothing",
      name: "Modern Linen Summer Shirt",
      description: "Perfectly breathable premium linen shirt designed for hot summer days. Soft-washed for an effortless, airy vintage look.",
      price: 65.00,
      images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 50
    },
    {
      category: "Men's Clothing",
      name: "Classic Crewneck Heavyweight Tee",
      description: "Cut from heavy 240GSM organic cotton. Preshrunk with a tight collar to maintain shape wash after wash.",
      price: 28.00,
      images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 120
    },

    // --- Women's Clothing ---
    {
      category: "Women's Clothing",
      name: "Elegant Double-Breasted Trench Coat",
      description: "A iconic luxury trench crafted from water-repellent gabardine. Features signature horn buttons, belt, and deep side pockets.",
      price: 249.00,
      images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 20,
      stock: 15
    },
    {
      category: "Women's Clothing",
      name: "Pleated Silk Floral Midi Dress",
      description: "Stunning bias-cut silk chiffon dress with hand-drawn botanical print. Flows elegantly and features delicate self-tie straps.",
      price: 135.00,
      images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 22
    },
    {
      category: "Women's Clothing",
      name: "Cozy Oversized Cashmere Cardigan",
      description: "Made from ethically-sourced Grade-A Mongolian cashmere. Luxuriously soft knit with a relaxed drape and beautiful tortoise buttons.",
      price: 160.00,
      images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 10,
      stock: 28
    },
    {
      category: "Women's Clothing",
      name: "High-Waisted Classic Straight Jeans",
      description: "A flattering 90s classic straight fit jeans with authentic rigid feel but woven with 1% elastane for seamless daily movement.",
      price: 78.00,
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 55
    },
    {
      category: "Women's Clothing",
      name: "Satin Elegance Slip Dress",
      description: "High-shine luxury heavyweight satin with a beautiful fluid drape. Features cowl neck design and an adjustable cross-back finish.",
      price: 95.00,
      images: ["https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 35
    },
    {
      category: "Women's Clothing",
      name: "Active Crop Top & High-Rise Leggings Set",
      description: "Sweat-wicking, buttery-soft performance set. High-waisted contour design ensures absolute comfort for high-intensity workouts or leisure.",
      price: 89.00,
      images: ["https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 5,
      stock: 45
    },
    {
      category: "Women's Clothing",
      name: "Minimalist Linen Utility Dress",
      description: "100% linen utility dress featuring a classic collared neckline, self-tie belt, and robust button front closure.",
      price: 98.00,
      images: ["https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 32
    },
    {
      category: "Women's Clothing",
      name: "Chiffon Romantic Puff Blouse",
      description: "Lightweight sheer chiffon blouse with romantic puff sleeves, ruffled mock neckline, and single back button closure.",
      price: 52.00,
      images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 48
    },

    // --- Premium Footwear ---
    {
      category: "Premium Footwear",
      name: "Handcrafted Heritage Leather Boots",
      description: "Tough yet exceptionally refined boot made of full-grain oil-tanned leather. Goodyear welted with a durable Vibram lug sole.",
      price: 210.00,
      images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 15,
      stock: 20
    },
    {
      category: "Premium Footwear",
      name: "Minimalist White Leather Sneakers",
      description: "Clean, ultra-premium Italian leather court sneakers. Features gold-embossed serial detail and comfortable calfskin interior lining.",
      price: 145.00,
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 50
    },
    {
      category: "Premium Footwear",
      name: "Classic Suede Chelsea Boots",
      description: "Ultra-sleek Italian split suede Chelsea boots with comfortable elastic side panels, back tabs, and durable crepe soles.",
      price: 175.00,
      images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 10,
      stock: 24
    },
    {
      category: "Premium Footwear",
      name: "Performance Breathable Mesh Runners",
      description: "Engineered ultra-lightweight mesh upper for perfect ventilation, responsive cushioned midsole, and high-friction rubber outsole.",
      price: 110.00,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 75
    },

    // --- Luxury Accessories ---
    {
      category: "Luxury Accessories",
      name: "Structured Canvas Weekend Duffel",
      description: "A heavy-duty water-resistant canvas duffel finished with beautiful vegetable-tanned leather straps and premium brass hardware.",
      price: 125.00,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 30
    },
    {
      category: "Luxury Accessories",
      name: "Minimalist Leather Card Holder",
      description: "Sleek bifold pocket organizer handcrafted from full-grain leather. Features 4 card slots, a central cash pocket, and RFID protection.",
      price: 39.00,
      images: ["https://images.unsplash.com/photo-1627124765135-56a2a7a2757a?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 80
    },
    {
      category: "Luxury Accessories",
      name: "Classic Acetate Polarized Sunglasses",
      description: "Timeless tortoiseshell frames meticulously hand-crafted from durable acetate. Equipped with 100% UVA/UVB protective polarized lenses.",
      price: 75.00,
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 5,
      stock: 45
    },
    {
      category: "Luxury Accessories",
      name: "Chunky Knit Merino Wool Beanie",
      description: "Super warm and incredibly soft chunky rib knit beanie made of pure Peruvian merino wool. Perfect luxury winter staple.",
      price: 35.00,
      images: ["https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=600&auto=format&fit=crop"],
      discountPercent: 0,
      stock: 65
    }
  ];

  for (const prod of productsData) {
    const category = categories[prod.category];
    const imagesArray = JSON.stringify(prod.images);

    await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        discountPercent: prod.discountPercent,
        images: imagesArray,
        stock: prod.stock,
        categoryId: category.id
      }
    });

    console.log(`✅ Seeded: "${prod.name}" under "${prod.category}"`);
  }

  console.log("\n🚀 Seeding successfully complete! 24 Premium Designer Clothing Products Imported!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
