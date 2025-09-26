import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductGrid from './ProductGrid';
import ImageWithFallback from './ImageWithFallback';
import { Product } from '../types';
import { defaultSizeAvailability, getSizeAvailability } from '../utils/sizeCharts';

interface ShoeLayoutProps {
  products: Product[];
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
}

export default function ShoeLayout({ products, title, description, loading, error }: ShoeLayoutProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const location = useLocation();
  // Extract path parts for breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isCollectionPage = pathParts[0] === 'collections';
  const currentPath = pathParts[1] === 'category' ? pathParts[2] || '' : pathParts[1] || '';
  const subcategory = pathParts[2] || '';
  const currentCategory = isCollectionPage ? '' : currentPath;
  
  // Map path segments to readable titles for breadcrumb
  const pathTitles: { [key: string]: string } = {
    men: "Men's",
    women: "Women's", 
    kids: "Kids'",
    socks: "Socks",
    accessories: "Accessories",
    active: "Active Shoes",
    "active-sneakers": "Active Sneakers",
    trainers: "Trainers",
    casual: "Casual Shoes",
    hiking: "Hiking Boots",
    "water-repellent": "Water Repellent",
    "best-sellers": "Best Sellers",
    "apparel": "Apparel & Accessories",
    "school": "School Shoes",
    "back-to-school": "Back to School",
    "summer": "Summer Collection",
    "toddler": "Toddler",
    "little-kids": "Little Kids",
    "big-kids": "Big Kids"
  };

  // Build breadcrumb items
  const breadcrumbs = pathParts.map((part, index) => {
    // Skip "category" in the breadcrumb
    if (part === 'category') return null;
    
    const path = '/' + pathParts.slice(0, index + 1).join('/');
    // Skip "collections" in the breadcrumb title
    const title = part === 'collections' ? '' : pathTitles[part] || part.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Only return if there's a title (skip empty titles from 'collections')
    return title ? { path, title } : null;
  }).filter(Boolean); // Remove null items (category)

  // Define category-specific navigation
  const categoryNavigation = {
    men: [
      { name: 'Trainers', path: '/category/men/trainers' },
      { name: 'Active Shoes', path: '/category/men/active' },
      { name: 'Water-Repellent', path: '/category/men/water-repellent' },
      { name: 'Casual Shoes', path: '/category/men/casual' },
      { name: 'Hiking Boots', path: '/category/men/hiking' },
      { name: 'Apparel', path: '/category/men/apparel' }
    ],
    'men-best-sellers': [
      { name: 'All Best Sellers', path: '/category/men/best-sellers' },
      { name: 'Trainers', path: '/category/men/trainers' },
      { name: 'Active Shoes', path: '/category/men/active' },
      { name: 'Casual Shoes', path: '/category/men/casual' },
      { name: 'Apparel', path: '/category/men/apparel' }
    ],
    women: [
      { name: 'Trainers', path: '/category/women/trainers' },
      { name: 'Running', path: '/category/women/running' },
      { name: 'Lifestyle', path: '/category/women/lifestyle' },
      { name: 'Flats', path: '/category/women/flats' },
      { name: 'Casual', path: '/category/women/casual' }
    ],
    'women-tops': [
      { name: 'All Tops', path: '/category/women/tops' },
      { name: 'T-Shirts', path: '/category/women/tops' },
      { name: 'Tank Tops', path: '/category/women/tops' },
      { name: 'Long Sleeve', path: '/category/women/tops' },
      { name: 'Activewear', path: '/category/women/activewear' }
    ],
    'women-leggings': [
      { name: 'All Leggings', path: '/category/women/leggings' },
      { name: 'Performance', path: '/category/women/leggings' },
      { name: 'Everyday', path: '/category/women/leggings' }
    ],
    'women-activewear': [
      { name: 'All Activewear', path: '/category/women/activewear' },
      { name: 'Tops', path: '/category/women/tops' },
      { name: 'Leggings', path: '/category/women/leggings' },
      { name: 'Sports Bras', path: '/category/women/activewear' }
    ],
    kids: [
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'Active Sneakers', path: '/category/kids/active' },
      { name: 'School Shoes', path: '/category/kids/school' },
      { name: 'Back to School', path: '/category/kids/back-to-school' },
      { name: 'Summer Collection', path: '/category/kids/summer' }
    ],
    'kids-best-sellers': [
      { name: 'All Best Sellers', path: '/category/kids/bestsellers' },
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'Active Sneakers', path: '/category/kids/active' },
      { name: 'School Shoes', path: '/category/kids/school' }
    ],
    'kids-trainers': [
      { name: 'All Trainers', path: '/category/kids/trainers' },
      { name: 'Active Sneakers', path: '/category/kids/active' },
      { name: 'School Shoes', path: '/category/kids/school' },
      { name: 'Back to School', path: '/category/kids/back-to-school' }
    ],
    'kids-active': [
      { name: 'All Active Sneakers', path: '/category/kids/active' },
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'Summer Collection', path: '/category/kids/summer' }
    ],
    'kids-school': [
      { name: 'All School Shoes', path: '/category/kids/school' },
      { name: 'Back to School', path: '/category/kids/back-to-school' },
      { name: 'Trainers', path: '/category/kids/trainers' }
    ],
    'kids-back-to-school': [
      { name: 'All Back to School', path: '/category/kids/back-to-school' },
      { name: 'School Shoes', path: '/category/kids/school' },
      { name: 'Trainers', path: '/category/kids/trainers' }
    ],
    'kids-summer': [
      { name: 'All Summer Collection', path: '/category/kids/summer' },
      { name: 'Active Sneakers', path: '/category/kids/active' },
      { name: 'Trainers', path: '/category/kids/trainers' }
    ],
    'kids-toddler': [
      { name: 'All Toddler Shoes', path: '/category/kids/toddler' },
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'Active Sneakers', path: '/category/kids/active' }
    ],
    'kids-little-kids': [
      { name: 'All Little Kids Shoes', path: '/category/kids/little-kids' },
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'School Shoes', path: '/category/kids/school' }
    ],
    'kids-big-kids': [
      { name: 'All Big Kids Shoes', path: '/category/kids/big-kids' },
      { name: 'Trainers', path: '/category/kids/trainers' },
      { name: 'Active Sneakers', path: '/category/kids/active' }
    ],
    'men-trainers': [
      { name: 'All Trainers', path: '/category/men/trainers' },
      { name: 'Active Shoes', path: '/category/men/active' },
      { name: 'Water-Repellent', path: '/category/men/water-repellent' },
      { name: 'Casual Shoes', path: '/category/men/casual' },
      { name: 'Hiking Boots', path: '/category/men/hiking' }
    ],
    'men-apparel': [
      { name: 'All Apparel', path: '/category/men/apparel' },
      { name: 'T-Shirts', path: '/category/men/apparel' },
      { name: 'Pants', path: '/category/men/apparel' },
      { name: 'Socks', path: '/category/socks' },
      { name: 'Accessories', path: '/category/accessories' }
    ],
    socks: [
      { name: 'Crew Socks', path: '/category/socks/crew' },
      { name: 'Ankle Socks', path: '/category/socks/ankle' },
      { name: 'No-Show Socks', path: '/category/socks/no-show' },
      { name: 'Running Socks', path: '/category/socks/running' },
      { name: 'Athletic Socks', path: '/category/socks/athletic' }
    ],
    accessories: [
      { name: 'Tote Bags', path: '/category/accessories/bags/tote' },
      { name: 'Backpacks', path: '/category/accessories/bags/backpack' },
      { name: 'Wallets', path: '/category/accessories/wallets' },
      { name: 'Watches', path: '/category/accessories/watches' },
      { name: 'Jewelry', path: '/category/accessories/bracelets' }
    ]
  };

  // Get navigation items based on current path
  const getCategories = () => {
    // Check if we're on a collection page
    if (isCollectionPage) return [];

    // Handle specific subcategories for men, women, and kids
    if ((currentPath === 'men' || currentPath === 'women' || currentPath === 'kids') && subcategory) {
      const key = `${currentPath}-${subcategory}` as keyof typeof categoryNavigation;
      
      if (categoryNavigation[key]) {
        return categoryNavigation[key];
      }

      // Special handling for women's apparel pages
      if (currentPath === 'women' && 
          (subcategory === 'tops' || subcategory === 'leggings' || subcategory === 'activewear')) {
        const apparelKey = `women-${subcategory}` as keyof typeof categoryNavigation;
        return categoryNavigation[apparelKey] || [];
      }

      // Special handling for kids' apparel pages
      if (currentPath === 'kids' && 
          (subcategory === 'apparel' || subcategory === 'school')) {
        const apparelKey = `kids-${subcategory}` as keyof typeof categoryNavigation;
        return categoryNavigation[apparelKey] || [];
      }
      
      return categoryNavigation[currentPath as keyof typeof categoryNavigation] || [];
    }
    
    // Handle main category pages
    if (currentPath === 'men' || currentPath === 'women' || 
        currentPath === 'kids' || currentPath === 'socks' || 
        currentPath === 'accessories') {
      return categoryNavigation[currentPath as keyof typeof categoryNavigation] || [];
    }
    
    return categoryNavigation[currentPath as keyof typeof categoryNavigation] || [];
  };

  const categories = getCategories();

  // Filter products based on selected size
  const filteredProducts = selectedSize
    ? products.filter(product => {
        const sizeAvailability = getSizeAvailability(currentPath);
        const sizeInfo = sizeAvailability.find(s => s.size === selectedSize);
        return sizeInfo?.inStock;
      })
    : products;

  const sizes = getSizeAvailability(currentPath).map(size => ({
    label: size.size.startsWith('EU') ? size.size : `${size.size}`,
    value: size.size
  }));

  const exploreMore = [
    {
      title: "New Arrivals",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&q=80", 
      link: "/collections/new"
    },
    {
      title: "Best Sellers",
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&q=80",
      link: "/collections/best-sellers"
    },
    {
      title: "Sale",
      image: "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&q=80",
      link: "/collections/sale"
    }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <div className="pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex gap-12">
            {/* Sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-40">
                {/* Breadcrumb */}
                <div className="mb-8 text-sm text-gray-500">
                  <Link to="/" className="hover:text-gray-900">Home</Link>
                  {breadcrumbs.map((crumb: any, index) => (
                    <span key={`${crumb.path}-${index}`}>
                      <span className="mx-2">/</span>
                      {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-900">{crumb.title}</span>
                      ) : (
                        <Link to={crumb.path} className="hover:text-gray-900">
                          {crumb.title}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>

                {/* Categories */}
                {!isCollectionPage && categories.length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-bold text-lg mb-6">
                      {(currentPath === 'women' && 
                        (subcategory === 'tops' || subcategory === 'leggings' || subcategory === 'activewear')) 
                          ? 'Apparel' 
                          : (currentPath === 'kids' && 
                             (subcategory === 'trainers' || subcategory === 'active' || 
                              subcategory === 'school' || subcategory === 'back-to-school' || 
                              subcategory === 'summer' || subcategory === 'toddler' || 
                              subcategory === 'little-kids' || subcategory === 'big-kids'))
                            ? 'Kids\' Categories'
                            : 'Categories'
                      }
                    </h3>
                    <ul className="space-y-4">
                      {categories.map((category, idx) => (
                        <li key={category.path} className="transform transition-transform hover:translate-x-1">
                          <Link
                            to={category.path}
                            className={`flex items-center py-2 px-3 rounded-md ${
                              location.pathname === category.path
                                ? 'bg-black text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-3 ${
                              location.pathname === category.path
                                ? 'bg-white'
                                : 'bg-gray-400'
                            }`}></span>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {!isCollectionPage && categories.length === 0 && (
                  <div className="mb-12">
                    <h3 className="font-bold text-lg mb-6">Categories</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-gray-600">No categories available.</p>
                      <p className="text-sm text-gray-500 mt-2">Check back soon for new options!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid
                products={products}
                title={title}
                description={description}
              />
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products in this category. Please check back later or browse our other collections.
                </p>
              </div>
            )}
            </div>
          </div>

          {/* Explore More Section */}
          <div className="mt-32">
            <h2 className="text-4xl font-bold mb-12 text-center">Explore More</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {exploreMore.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.link}
                  className="relative group overflow-hidden rounded-lg transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white text-3xl font-bold mb-4">{item.title}</h3>
                      <span
                        className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-md hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <span className="font-medium">Shop Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="mt-32 relative rounded-xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1606297199333-e93f7d726cab?auto=format&q=80"
              alt="Special Offer"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-4xl font-bold mb-4">Special Offer</h2>
                <p className="text-xl mb-6">Get 20% off on selected items</p>
                <Link
                  to="/collections/special-offer"
                  className="inline-block bg-white text-black px-8 py-3 rounded-md hover:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="font-medium">Shop Now</span>
                </Link>
              </div>
            </div>
          </div>

          {/* WearXpress Approach */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-12 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Sustainable Materials</h3>
              <p className="text-gray-600">
                Made with eco-friendly materials for a better tomorrow
              </p>
            </div>
            <div className="text-center p-12 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Superior Comfort</h3>
              <p className="text-gray-600">
                Engineered for all-day comfort and support
              </p>
            </div>
            <div className="text-center p-12 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">100-Day Trial</h3>
              <p className="text-gray-600">
                Try our shoes risk-free for 100 days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}