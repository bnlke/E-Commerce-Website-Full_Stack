interface SizeChart {
  title: string;
  description?: string;
  headers: string[];
  rows: (string | number)[][];
}

interface SizeGuide {
  [key: string]: SizeChart;
}

export const sizeGuides: SizeGuide = {
  // Shoes size chart
  shoes: {
    title: "Shoe Size Guide",
    description: "Find your perfect fit. For the best results, measure your feet in the afternoon.",
    headers: ["EU", "US", "UK", "CM", "Foot Length"],
    rows: [
      [35, 4, 2, 22.1, "8.7\""],
      [36, 5, 3, 22.8, "9\""],
      [37, 6, 4, 23.5, "9.25\""],
      [38, 7, 5, 24.1, "9.5\""],
      [39, 8, 6, 24.8, "9.75\""],
      [40, 9, 7, 25.4, "10\""],
      [41, 10, 8, 26.0, "10.25\""],
      [42, 11, 9, 26.7, "10.5\""],
      [43, 12, 10, 27.3, "10.75\""],
      [44, 13, 11, 28.0, "11\""],
      [45, 14, 12, 28.6, "11.25\""],
      [46, 15, 13, 29.2, "11.5\""]
    ]
  },

  // Clothing size chart
  clothing: {
    title: "Apparel Size Guide",
    description: "European sizing. For best results, take measurements over undergarments.",
    headers: ["EU Size", "Chest (cm)", "Waist (cm)", "Hip (cm)", "Sleeve (cm)"],
    rows: [
      ["44 (XS)", "81-86", "66-71", "86-91", "80"],
      ["46 (S)", "89-94", "74-79", "94-99", "81"],
      ["48 (M)", "97-102", "81-86", "102-107", "82"],
      ["50 (L)", "104-109", "89-94", "109-114", "84"],
      ["52 (XL)", "112-117", "97-102", "117-122", "85"],
      ["54 (XXL)", "119-124", "104-109", "124-129", "86"]
    ]
  },

  // Socks size chart
  socks: {
    title: "Socks Size Guide",
    description: "Find your perfect sock size based on your shoe size.",
    headers: ["Size", "EU Shoe", "US Men", "US Women"],
    rows: [
      ["S", "35-38", "3-5", "4-6"],
      ["M", "39-42", "6-8", "7-9"],
      ["L", "43-46", "9-11", "10-12"],
      ["XL", "47-50", "12-14", "13-15"]
    ]
  },

  // Accessories size chart (for items like hats)
  accessories: {
    title: "Hat Size Guide",
    description: "Measure the circumference of your head about 1/2 inch above your eyebrows.",
    headers: ["Size", "Inches", "CM"],
    rows: [
      ["S", "21-21.5", "53.3-54.6"],
      ["M", "22-22.5", "55.9-57.2"],
      ["L", "23-23.5", "58.4-59.7"],
      ["XL", "24-24.5", "61-62.2"]
    ]
  },

  // One size items
  oneSize: {
    title: "One Size",
    description: "This item comes in one universal size designed to fit most people.",
    headers: ["Size", "Details"],
    rows: [
      ["One Size", "Designed to fit most adults"]
    ]
  }
};

export const defaultSizeAvailability = [
  { size: 'One Size', inStock: true }
];

export function getSizeAvailability(category: string) {
  if (!category) return defaultSizeAvailability;

  // Men's shoes sizes
  if (category.includes('shoes') || 
      category.includes('trainers') || 
      category.includes('boots') || 
      category.includes('sneakers') ||
      category.includes('mens-best-sellers')) {
    return [
      { size: '41', inStock: true },
      { size: '42', inStock: true },
      { size: '43', inStock: true },
      { size: '44', inStock: true },
      { size: '45', inStock: true },
      { size: '46', inStock: true }
    ];
  }

  // Women's shoes sizes
  if (category.includes('womens-') && 
      (category.includes('shoes') || 
       category.includes('trainers') || 
       category.includes('boots') || 
       category.includes('sneakers'))) {
    return [
      { size: '36', inStock: true },
      { size: '37', inStock: true },
      { size: '38', inStock: true },
      { size: '39', inStock: true },
      { size: '40', inStock: true },
      { size: '41', inStock: true }
    ];
  }

  // Kids' shoes sizes
  if (category.includes('kids-') && 
      (category.includes('shoes') || 
       category.includes('trainers') || 
       category.includes('boots') || 
       category.includes('sneakers'))) {
    return [
      { size: '32', inStock: true },
      { size: '33', inStock: true },
      { size: '34', inStock: true },
      { size: '35', inStock: true },
      { size: '36', inStock: true },
      { size: '37', inStock: true }
    ];
  }
  
  // Clothing sizes
  if (category.includes('apparel') || 
      category.includes('clothing') || 
      category.includes('tops') || 
      category.includes('leggings')) {
    return [
      { size: 'XS', inStock: true },
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ];
  }

  // Shirts and T-shirts specific sizes
  if (category.includes('shirt') ||
      category.includes('tees')) {
    return [
      { size: 'XS', inStock: true },
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
      { size: 'XXL', inStock: true }
    ];
  }
  
  // Socks sizes
  if (category.includes('socks')) {
    return [
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true }
    ];
  }
  
  // One size items
  if (category.includes('accessories') ||
      category.includes('bags') ||
      category.includes('wallets') ||
      category.includes('watches') ||
      category.includes('jewelry') ||
      category.includes('hats') ||
      category.includes('gift-cards')) {
    return defaultSizeAvailability;
  }

  return defaultSizeAvailability;
};

export function getSizeGuide(category: string): SizeChart {
  if (!category) {
    return sizeGuides.shoes; // Default to shoes size guide
  }

  // Map category to appropriate size guide
  if (category.includes('shoes') || 
      category.includes('trainers') || 
      category.includes('boots') || 
      category.includes('sneakers')) {
    return sizeGuides.shoes;
  }
  
  if (category.includes('apparel') || 
      category.includes('tops') || 
      category.includes('leggings')) {
    return sizeGuides.clothing;
  }
  
  if (category.includes('socks')) {
    return sizeGuides.socks;
  }
  
  if (category.includes('hats') || 
      category.includes('caps')) {
    return sizeGuides.accessories;
  }
  
  // Default to one size for other accessories
  return sizeGuides.oneSize;
}