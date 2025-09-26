// Shared types and interfaces
export interface CategoryItem {
  name: string;
  link: string;
}

export interface CategorySection {
  title: string;
  items: CategoryItem[];
}

export interface FeaturedItem {
  title: string;
  image: string;
  link: string;
}

// Category data exports
export const womenCategories: CategorySection[] = [
  {
    title: "SHOES",
    items: [
      { name: "Trainers", link: "/category/women/trainers" },
      { name: "Running Shoes", link: "/category/women/running" },
      { name: "Lifestyle Sneakers", link: "/category/women/lifestyle" },
      { name: "Flats", link: "/category/women/flats" }
    ]
  },
  {
    title: "BEST SELLERS",
    items: [
      { name: "Tree Breezers", link: "/category/women/best-sellers" },
      { name: "Wool Runners", link: "/category/women/best-sellers" },
      { name: "Tree Dashers", link: "/category/women/best-sellers" }
    ]
  },
  {
    title: "APPAREL & MORE",
    items: [
      { name: "Activewear", link: "/category/women/activewear" },
      { name: "Leggings", link: "/category/women/leggings" },
      { name: "Tops", link: "/category/women/tops" }
    ]
  }
];

export const menCategories: CategorySection[] = [
  {
    title: "SHOES",
    items: [
      { name: "Trainers", link: "/category/men/trainers" },
      { name: "Active Shoes", link: "/category/men/active" },
      { name: "Water-Repellent", link: "/category/men/water-repellent" },
      { name: "Casual Shoes", link: "/category/men/casual" },
      { name: "Hiking Boots", link: "/category/men/hiking" }
    ]
  },
  {
    title: "BEST SELLERS",
    items: [
      { name: "Tree Runner", link: "/category/men/best-sellers" },
      { name: "Tree Dasher 2", link: "/category/men/best-sellers" },
      { name: "Wool Runner Mizzle", link: "/category/men/best-sellers" }
    ]
  },
  {
    title: "APPAREL & MORE",
    items: [
      { name: "Apparel", link: "/category/men/apparel" },
      { name: "Socks", link: "/category/socks" },
      { name: "Accessories", link: "/category/accessories" }
    ]
  }
];

export const kidsCategories: CategorySection[] = [
  {
    title: "SHOES",
    items: [
      { name: "Trainers", link: "/category/kids/trainers" },
      { name: "Active Sneakers", link: "/category/kids/active" },
      { name: "School Shoes", link: "/category/kids/school" }
    ]
  },
  {
    title: "AGE GROUPS",
    items: [
      { name: "Toddler (1-3)", link: "/category/kids/toddler" },
      { name: "Little Kids (4-8)", link: "/category/kids/little-kids" },
      { name: "Big Kids (9-12)", link: "/category/kids/big-kids" }
    ]
  },
  {
    title: "FEATURED",
    items: [
      { name: "New Arrivals", link: "/category/kids/new" },
      { name: "Best Sellers", link: "/category/kids/bestsellers" },
      { name: "Sale", link: "/category/kids/sale" }
    ]
  }
];

export const sockCategories: CategorySection[] = [
  {
    title: "STYLES",
    items: [
      { name: "Ankle Socks", link: "/category/socks/ankle" },
      { name: "Crew Socks", link: "/category/socks/crew" },
      { name: "No-Show Socks", link: "/category/socks/no-show" }
    ]
  },
  {
    title: "ACTIVITIES",
    items: [
      { name: "Running", link: "/category/socks/running" },
      { name: "Everyday", link: "/category/socks/everyday" },
      { name: "Athletic", link: "/category/socks/athletic" }
    ]
  },
  {
    title: "COLLECTIONS",
    items: [
      { name: "Limited Edition", link: "/category/socks/limited" },
      { name: "Merino Wool", link: "/category/socks/merino" },
      { name: "Organic Cotton", link: "/category/socks/organic" }
    ]
  }
];

export const accessoryCategories: CategorySection[] = [
  {
    title: "BAGS & WALLETS",
    items: [
      { name: "Tote Bags", link: "/category/accessories/bags/tote" },
      { name: "Backpacks", link: "/category/accessories/bags/backpack" },
      { name: "Wallets", link: "/category/accessories/wallets" }
    ]
  },
  {
    title: "JEWELRY",
    items: [
      { name: "Watches", link: "/category/accessories/watches" },
      { name: "Bracelets", link: "/category/accessories/bracelets" },
      { name: "Necklaces", link: "/category/accessories/necklaces" }
    ]
  },
  {
    title: "OTHER",
    items: [
      { name: "Hats & Caps", link: "/category/accessories/hats" },
      { name: "Shoe Care", link: "/category/accessories/shoe-care" },
      { name: "Gift Cards", link: "/category/accessories/gift-cards" }
    ]
  }
];

export const saleCategories: CategorySection[] = [
  {
    title: "CATEGORIES",
    items: [
      { name: "Men's Sale", link: "/sale/men" },
      { name: "Women's Sale", link: "/sale/women" },
      { name: "Kids' Sale", link: "/sale/kids" }
    ]
  }
];