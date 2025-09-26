import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CategorySection, FeaturedItem } from '../utils/categoryData';
import ImageWithFallback from './ImageWithFallback';

interface CategoryLayoutProps {
  categories: CategorySection[];
  featuredItems: FeaturedItem[];
}

export default function CategoryLayout({ categories, featuredItems }: CategoryLayoutProps) {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentCategory = pathParts[1]; // e.g., 'men', 'women', 'kids'

  // Category-specific titles for breadcrumbs
  const categoryTitles = {
    men: "Men's Collection",
    women: "Women's Collection",
    kids: "Kids' Collection",
    socks: "Socks Collection",
    accessories: "Accessories Collection"
  };

  const categoryTitle = categoryTitles[currentCategory as keyof typeof categoryTitles] || '';

  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, i * 100);
    });
  }, []);

  return (
    <div className="pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="animate-on-mount opacity-0 translate-y-4">
              <h2 className="font-bold text-lg mb-4">{category.title}</h2>
              {category.items.length > 0 ? (
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i}>
                      <a 
                        href={item.link}
                        className="text-gray-600 hover:text-black transition-colors"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No categories available.</p>
              )}
            </div>
          ))}

          <div className="col-span-4 mt-8">
            <div className="grid grid-cols-2 gap-8">
              {featuredItems.map((item, index) => (
                <div 
                  key={index}
                  className="animate-on-mount opacity-0 translate-y-4 relative group overflow-hidden rounded-lg"
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white text-3xl font-bold mb-4">{item.title}</h3>
                      <Link
                        href={item.link}
                        to={item.link}
                        className="inline-flex items-center space-x-2 bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}