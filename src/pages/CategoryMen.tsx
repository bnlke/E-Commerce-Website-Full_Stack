import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    title: "SHOES",
    items: [
      { name: "Trainers", link: "/category/men/trainers" },
      { name: "Active Shoes", link: "/category/men/active" },
      { name: "Water-Repellent Shoes", link: "/category/men/water-repellent" },
      { name: "Casual Shoes", link: "/category/men/casual" },
      { name: "Hiking Boots", link: "/category/men/hiking" }
    ]
  },
  {
    title: "BEST SELLERS",
    items: [
      { name: "Tree Runner", link: "/category/men/best-sellers" },
      { name: "Tree Dasher 2", link: "/category/men/best-sellers" },
      { name: "Wool Runner Mizzle", link: "/category/men/best-sellers" },
      { name: "Tree Skipper", link: "/category/men/best-sellers" },
      { name: "Tree Lounger", link: "/category/men/best-sellers" }
    ]
  },
  {
    title: "APPAREL & MORE",
    items: [
      { name: "Tees", link: "/category/men/apparel" },
      { name: "Performance Shorts", link: "/category/men/apparel" },
      { name: "Socks", link: "/category/men/apparel" },
      { name: "Caps & Beanies", link: "/category/men/apparel" },
      { name: "Underwear", link: "/category/men/apparel" }
    ]
  }
];

const featuredItems = [
  {
    title: "THE NEW WOOL RUNNER GO",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
    link: "/product/wool-runner-go"
  },
  {
    title: "RAIN-READY SHOES",
    image: "https://images.unsplash.com/photo-1520256862855-398228c41684",
    link: "/category/men/water-repellent"
  }
];

export default function CategoryMen() {
  useEffect(() => {
    // Add animation class after component mounts
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, i * 100); // Stagger the animations
    });
  }, []);

  return (
    <div className="pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-8">
          {/* Categories */}
          {categories.map((category, index) => (
            <div key={index} className="animate-on-mount opacity-0 translate-y-4">
              <h2 className="font-bold text-lg mb-4">{category.title}</h2>
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
            </div>
          ))}

          {/* Featured Section */}
          <div className="col-span-4 mt-8">
            <div className="grid grid-cols-2 gap-8">
              {featuredItems.map((item, index) => (
                <div 
                  key={index}
                  className="animate-on-mount opacity-0 translate-y-4 relative group overflow-hidden rounded-lg"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white text-3xl font-bold mb-4">{item.title}</h3>
                      <Link 
                        to={item.link}
                        className="inline-flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-md hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-1 duration-300"
                      >
                        <span className="font-medium">Shop Now</span>
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