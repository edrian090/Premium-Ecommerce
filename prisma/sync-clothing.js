const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("----------------------------------------");
  console.log("🧹 Step 1: Cleaning up existing dummy data...");
  console.log("----------------------------------------");
  
  try {
    // Clear dependent tables first
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
    
    console.log("✨ Cleanup successfully completed!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  }

  console.log("\n----------------------------------------");
  console.log("📡 Step 2: Fetching clothing products from Fake Store API...");
  console.log("----------------------------------------");
  
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    if (!res.ok) {
      throw new Error(`Failed to fetch from API: status ${res.status}`);
    }
    const products = await res.json();
    
    // Filter for men's and women's clothing
    const clothingItems = products.filter(p => 
      p.category === "men's clothing" || p.category === "women's clothing"
    );
    
    console.log(`Found ${clothingItems.length} clothing items in API response.`);

    console.log("\n----------------------------------------");
    console.log("💾 Step 3: Seeding products into local database...");
    console.log("----------------------------------------");

    for (const item of clothingItems) {
      // Map and capitalize category name nicely
      const categoryName = item.category === "men's clothing" ? "Men's Clothing" : "Women's Clothing";
      
      // Get or create category
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `Premium ${categoryName} Collection`
        }
      });

      // Format product images to JSON string array as SQLite stores it
      const imagesArray = JSON.stringify([item.image]);

      // Create new clothing product
      const createdProduct = await prisma.product.create({
        data: {
          id: `clothing-${item.id}`,
          name: item.title,
          description: item.description,
          price: item.price,
          discountPercent: Math.random() > 0.6 ? 10 : 0, // 40% chance of a 10% discount
          images: imagesArray,
          stock: Math.floor(Math.random() * 80) + 20, // random stock between 20 and 99
          categoryId: category.id
        }
      });
      
      console.log(`✅ Imported: "${createdProduct.name}" (${categoryName}) - $${createdProduct.price}`);
    }
    
    console.log("\n🚀 All products imported and database is ready to go!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
