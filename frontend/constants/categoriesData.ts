export type TopLevelCategory = "Shoes" | "Clothing" | "Accessories" | "Brands";

export interface Subcategory {
  name: string;
  route: string;
}

export interface PrimaryCategory {
  route: string;
  items: Subcategory[];
}

// Data to fill the Navigation Bar and DropdownBox
const categories: Record<TopLevelCategory, Record<string, PrimaryCategory>> = {
  Shoes: {
    "Men's Shoes": {
      route: "/categories/mens-shoes",
      items: [
        { name: "Sneakers", route: "sneakers" },
        { name: "Dress Shoes", route: "dress-shoes" },
        { name: "Boots", route: "boots" },
        { name: "Sandals & Slides", route: "sandals-slides" },
        { name: "Loafers", route: "loafers" },
      ],
    },
    "Women's Shoes": {
      route: "/categories/womens-shoes",
      items: [
        { name: "Casual Shoes", route: "casual-shoes" },
        { name: "Sneakers", route: "sneakers" },
        { name: "Heels", route: "heels" },
        { name: "Flats", route: "flats" },
        { name: "Boots", route: "boots" },
        { name: "Sandals & Slides", route: "sandals-slides" },
      ],
    },
  },
  Clothing: {
    "Men's Clothing": {
      route: "/categories/mens-clothing",
      items: [
        { name: "T-Shirts", route: "t-shirts" },
        { name: "Dress Shirts", route: "dress-shirts" },
        { name: "Casual Shirts", route: "casual-shirts" },
        { name: "Jackets & Coats", route: "jackets-coats" },
        { name: "Jeans", route: "jeans" },
        { name: "Trousers", route: "trousers" },
        { name: "Shorts", route: "shorts" },
        { name: "Sweats and Hoodies", route: "sweats-hoodies" },
      ],
    },
    "Women's Clothing": {
      route: "/categories/womens-clothing",
      items: [
        { name: "Tops", route: "tops" },
        { name: "Dresses", route: "dresses" },
        { name: "Skirts", route: "skirts" },
        { name: "Pants", route: "pants" },
        { name: "Blouses", route: "blouses" },
        { name: "Jackets & Coats", route: "jackets-coats" },
        { name: "Activewear", route: "activewear" },
        { name: "Loungewear", route: "loungewear" },
        { name: "Sweats and Hoodies", route: "sweats-hoodies" },
      ],
    },
  },
  Accessories: {
    "Bags & Backpacks": {
      route: "/categories/bags-backpacks",
      items: [
        { name: "Handbags", route: "handbags" },
        { name: "Backpacks", route: "backpacks" },
        { name: "Tote Bags", route: "tote-bags" },
        { name: "Crossbody Bags", route: "crossbody-bags" },
        { name: "Duffel Bags", route: "duffel-bags" },
      ],
    },
    "Jewellery": {
      route: "/categories/jewellery",
      items: [
        { name: "Necklaces", route: "necklaces" },
        { name: "Bracelets", route: "bracelets" },
        { name: "Earrings", route: "earrings" },
        { name: "Rings", route: "rings" },
        { name: "Watches", route: "watches" },
      ],
    },
    "Hats & Headwear": {
      route: "/categories/hats-headwear",
      items: [
        { name: "Caps", route: "caps" },
        { name: "Beanies", route: "beanies" },
        { name: "Sun Hats", route: "sun-hats" },
      ],
    },
    "Belts & Wallets": {
      route: "/categories/belts-wallets",
      items: [
        { name: "Belts", route: "belts" },
        { name: "Wallets", route: "wallets" },
        { name: "Cardholders", route: "cardholders" },
      ],
    },
    "Sunglasses & Eyewear": {
      route: "/categories/sunglasses-eyewear",
      items: [
        { name: "Sunglasses", route: "sunglasses" },
        { name: "Accessories", route: "accessories" },
      ],
    },
  },
  Brands: {
    "View All Brands": {
      route: "/brand",
      items: [
        { name: "Five By Flynn", route: "brand-details/354117646" },
        { name: "Venroy", route: "brand-details/805882352" },
        { name: "Alfie's Mission", route: "brand-details/784705881" },
        { name: "Asha Jasper", route: "brand-details/537647058" },
        { name: "The Snakehole", route: "brand-details/364705881" },
        { name: "Listen Clothing", route: "brand-details/742352940" },
      ],
    },
  },
};

const routeToDisplayName: Record<string, string> = {};

Object.keys(categories).forEach((topLevel) => {
  const primaryCategories = categories[topLevel as TopLevelCategory];
  Object.entries(primaryCategories).forEach(([displayName, primaryCategory]) => {
    if (topLevel === "Brands") {
      primaryCategory.items.forEach((subcategory) => {
        routeToDisplayName[subcategory.route] = subcategory.name;
      });
    } else {
      const categoryRouteKey = primaryCategory.route.split('/').pop();
      if (categoryRouteKey) {
        routeToDisplayName[categoryRouteKey] = displayName;
      }
      primaryCategory.items.forEach((subcategory) => {
        routeToDisplayName[subcategory.route] = subcategory.name;
      });
    }
  });
});

export const getCategoryDisplayName = (category: string) => routeToDisplayName[category] || category;
export const getSubcategoryDisplayName = (subcategory: string) => routeToDisplayName[subcategory] || subcategory;

export { categories, routeToDisplayName };
