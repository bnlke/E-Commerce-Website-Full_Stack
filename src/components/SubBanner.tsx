import { Link } from 'react-router-dom';

const categories = [
  { name: "Women's Shoes", path: '/category/women/trainers' },
  { name: "Men's Shoes", path: '/category/men/trainers' },
  { name: "Kids' Shoes", path: '/category/kids/trainers' },
  { name: "New Arrivals", path: '/collections/new' },
];

export default function SubBanner() {
  return (
    <div className="bg-gray-100">
      <div className="container mx-auto px-4">
        <ul className="flex justify-center space-x-8 h-10 items-center">
          {categories.map((category) => (
            <li key={category.path}>
              <button
                onClick={() => window.location.href = category.path}
                to={category.path}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}