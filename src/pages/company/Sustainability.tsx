export default function Sustainability() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sustainability</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment to creating a more sustainable future through innovative
            footwear solutions and responsible practices.
          </p>
        </div>

        {/* Goals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"
              alt="Sustainability Goals"
              className="rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Goals</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">2025 Targets</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 100% recycled packaging materials</li>
                  <li>• Carbon neutral operations</li>
                  <li>• 50% reduction in water usage</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">2030 Vision</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Zero waste manufacturing</li>
                  <li>• 100% renewable energy</li>
                  <li>• Circular product lifecycle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Initiatives Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Initiatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Materials Innovation</h3>
              <p className="text-gray-600 mb-6">
                Using recycled and sustainable materials in our products.
              </p>
              <div className="space-y-2">
                <p className="font-medium">Impact:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 2M+ lbs recycled materials used</li>
                  <li>• 10M+ plastic bottles recycled</li>
                  <li>• 500M+ gallons water saved</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Carbon Reduction</h3>
              <p className="text-gray-600 mb-6">
                Minimizing our carbon footprint across operations.
              </p>
              <div className="space-y-2">
                <p className="font-medium">Progress:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 100% carbon offset achieved</li>
                  <li>• 100% renewable energy use</li>
                  <li>• 50% emission reduction</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Circular Economy</h3>
              <p className="text-gray-600 mb-6">
                Implementing recycling and reuse programs.
              </p>
              <div className="space-y-2">
                <p className="font-medium">Results:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 500K+ products recycled</li>
                  <li>• 75% waste reduction</li>
                  <li>• 1M+ lbs materials reused</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <img
                src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e"
                alt="Sustainable Manufacturing"
                className="rounded-lg mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Sustainable Manufacturing</h3>
              <p className="text-gray-600">
                Our manufacturing process is designed to minimize waste and maximize
                resource efficiency. We use renewable energy and implement water
                conservation practices throughout our facilities.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1602751584552-8ba73aad10e1"
                alt="Material Innovation"
                className="rounded-lg mb-6"
              />
              <h3 className="text-xl font-bold mb-4">Material Innovation</h3>
              <p className="text-gray-600">
                We continuously research and develop new sustainable materials,
                working with partners to create innovative solutions that reduce
                our environmental impact while maintaining product quality.
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Certifications & Recognition</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="font-bold mb-2">B Corp Certified</h3>
              <p className="text-gray-600">Meeting highest standards of social and environmental performance</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="font-bold mb-2">Cradle to Cradle</h3>
              <p className="text-gray-600">Certified for circular design and manufacturing</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="font-bold mb-2">Climate Neutral</h3>
              <p className="text-gray-600">Verified carbon neutral operations</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💧</span>
              </div>
              <h3 className="font-bold mb-2">Water Wise</h3>
              <p className="text-gray-600">Recognized for water conservation efforts</p>
            </div>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Together, we can create a more sustainable future. Learn more about
            our initiatives on our social media channels.
          </p>
        </div>
      </div>
    </div>
  );
}