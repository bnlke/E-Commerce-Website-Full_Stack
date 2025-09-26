import { ArrowRight, Leaf, Recycle, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SustainabilityApproach() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sustainability In Every Step</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to sustainability goes beyond materials. From production to
            packaging, we're working to reduce our environmental impact at every stage.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Leaf className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold mb-2">90%</h3>
            <p className="text-gray-600">Materials from sustainable sources</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Recycle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-2xl font-bold mb-2">2M+</h3>
            <p className="text-gray-600">Plastic bottles recycled into shoes</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Droplets className="w-12 h-12 mx-auto mb-4 text-cyan-600" />
            <h3 className="text-2xl font-bold mb-2">95%</h3>
            <p className="text-gray-600">Water recycled in production</p>
          </div>
        </div>

        {/* Materials Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Sustainable Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <img
                src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1"
                alt="Sustainable Materials"
                className="rounded-lg mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Recycled Materials</h3>
              <p className="text-gray-600">
                We transform plastic bottles into durable, comfortable footwear,
                giving new life to materials that would otherwise end up in landfills.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1606297199333-e93f7d726cab"
                alt="Natural Materials"
                className="rounded-lg mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Natural Materials</h3>
              <p className="text-gray-600">
                From organic cotton to natural rubber, we prioritize renewable
                resources that minimize our environmental impact.
              </p>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-gray-50 rounded-lg p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Sustainability Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">2025 Goals</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• 100% recycled packaging materials</li>
                <li>• Carbon neutral operations</li>
                <li>• 50% reduction in water usage</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">2030 Vision</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• Zero waste manufacturing</li>
                <li>• 100% renewable energy</li>
                <li>• Circular product lifecycle</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Shop Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Shop Sustainably</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our collection of sustainable footwear and join us in our
            mission to create a better future.
          </p>
          <Link
            to="/collections/sustainable"
            className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            <span>Shop Sustainable Collection</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}