import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MaterialsApproach() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Materials From The Earth</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe in working with nature, not against it. Our materials are
            carefully selected to minimize environmental impact while maximizing
            comfort and performance.
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e"
              alt="Merino Wool"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Merino Wool</h3>
              <p className="text-gray-600">
                Natural temperature regulation and moisture-wicking properties
                for year-round comfort.
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1"
              alt="Tree Fiber"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Tree Fiber</h3>
              <p className="text-gray-600">
                Sustainably harvested eucalyptus fiber creates breathable,
                silky-smooth comfort.
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1606297199333-e93f7d726cab"
              alt="Sugarcane"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Sugarcane</h3>
              <p className="text-gray-600">
                Renewable sugarcane EVA provides cushioning while reducing
                our carbon footprint.
              </p>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Material Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">Sourcing</h3>
              <p className="text-gray-600">Carefully selected sustainable materials</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">Processing</h3>
              <p className="text-gray-600">Low-impact manufacturing methods</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">Testing</h3>
              <p className="text-gray-600">Rigorous quality and comfort testing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">Implementation</h3>
              <p className="text-gray-600">Integration into final products</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 rounded-lg p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Material Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">For You</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• Superior comfort and breathability</li>
                <li>• Natural odor resistance</li>
                <li>• Durable and long-lasting</li>
                <li>• Temperature regulation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">For the Planet</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• Reduced carbon footprint</li>
                <li>• Biodegradable materials</li>
                <li>• Less water consumption</li>
                <li>• Renewable resources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shop Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Experience Natural Comfort</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Try our eco-friendly materials and feel the difference natural
            comfort can make.
          </p>
          <Link
            to="/collections/sustainable"
            className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            <span>Shop Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}