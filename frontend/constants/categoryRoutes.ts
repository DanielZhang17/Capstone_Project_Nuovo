// categoryRoutes.ts

export const categoryMappings = {
  // Men's Shoes
  "mens-shoes": "Men's Shoes",
  "sneakers": "Sneakers",
  "dress-shoes": "Dress Shoes",
  "boots": "Boots",
  "sandals-slides": "Sandals & Slides",
  "loafers": "Loafers",

  // Women's Shoes
  "womens-shoes": "Women's Shoes",
  "casual-shoes": "Casual Shoes",
  "heels": "Heels",
  "flats": "Flats",

  // Men's Clothing
  "mens-clothing": "Men's Clothing",
  "t-shirts": "T-Shirts",
  "dress-shirts": "Dress Shirts",
  "casual-shirts": "Casual Shirts",
  "jackets-coats": "Jackets & Coats",
  "jeans": "Jeans",
  "trousers": "Trousers",
  "shorts": "Shorts",
  "sweats-hoodies": "Sweats and Hoodies",

  // Women's Clothing
  "womens-clothing": "Women's Clothing",
  "tops": "Tops",
  "dresses": "Dresses",
  "skirts": "Skirts",
  "pants": "Pants",
  "blouses": "Blouses",
  "activewear": "Activewear",
  "loungewear": "Loungewear",

  // Accessories - Bags & Backpacks
  "bags-backpacks": "Bags & Backpacks",
  "handbags": "Handbags",
  "backpacks": "Backpacks",
  "tote-bags": "Tote Bags",
  "crossbody-bags": "Crossbody Bags",
  "duffel-bags": "Duffel Bags",

  // Accessories - Jewellery
  "jewellery": "Jewellery",
  "necklaces": "Necklaces",
  "bracelets": "Bracelets",
  "earrings": "Earrings",
  "rings": "Rings",
  "watches": "Watches",

  // Accessories - Hats & Headwear
  "hats-headwear": "Hats & Headwear",
  "caps": "Caps",
  "beanies": "Beanies",
  "sun-hats": "Sun Hats",

  // Accessories - Belts & Wallets
  "belts-wallets": "Belts & Wallets",
  "belts": "Belts",
  "wallets": "Wallets",
  "cardholders": "Cardholders",

  // Accessories - Sunglasses & Eyewear
  "sunglasses-eyewear": "Sunglasses & Eyewear",
  "sunglasses": "Sunglasses",
  "accessories": "Accessories",
};

export function getCategoryName(route: string): string {
  return categoryMappings[route] || route;
}
