import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComfortApproach() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Wear-All-Day Comfort</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience unparalleled comfort with our innovative approach to footwear design.
            Every pair is engineered to provide support and comfort throughout your day.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <h3 className="text-xl font-bold mb-4">Responsive Cushioning</h3>
              <p className="text-gray-600">
                Our proprietary cushioning system adapts to your movement,
                providing the perfect balance of support and flexibility.
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <h3 className="text-xl font-bold mb-4">Anatomical Design</h3>
              <p className="text-gray-600">
                Each shoe is crafted to follow the natural contours of your feet,
                ensuring optimal fit and comfort.
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-8 h-full">
              <h3 className="text-xl font-bold mb-4">Breathable Materials</h3>
              <p className="text-gray-600">
                Temperature-regulating materials keep your feet cool and
                comfortable throughout the day.
              </p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative rounded-xl overflow-hidden mb-20">
          <img
            src="https://images.unsplash.com/photo-1491553895911-0055eca6402d"
            alt="Comfort Technology"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">COMFORT MEETS INNOVATION</h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto">
                Our shoes combine cutting-edge comfort technology with sustainable materials
                for an unmatched wearing experience.
              </p>
            </div>
          </div>
        </div>

        {/* Shop Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Experience the Comfort</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our collection of comfortable, sustainable footwear and feel
            the difference for yourself.
          </p>
          <Link
            to="/collections/comfort"
            className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            <span>Shop Comfort Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}