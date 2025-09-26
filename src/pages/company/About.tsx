export default function About() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Founded in 2020, WearXpress was born from a simple idea: create comfortable,
            sustainable footwear that looks good and feels even better.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.unsplash.com/photo-1606297199333-e93f7d726cab"
              alt="Our Mission"
              className="rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              We're on a mission to revolutionize the footwear industry through
              sustainable innovation. Every pair of shoes we create is designed
              with both your comfort and the planet in mind.
            </p>
            <p className="text-gray-600">
              By looking to nature for inspiration and solutions, we're creating
              products that deliver unrivaled comfort while minimizing our
              environmental impact.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-bold mb-4">Sustainability</h3>
                <p className="text-gray-600">
                  We believe in creating products that are kind to the planet.
                  From materials to manufacturing, sustainability is at the heart
                  of everything we do.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We're constantly pushing boundaries to create better, more
                  sustainable solutions in footwear design and manufacturing.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gray-50 rounded-lg p-8 h-full">
                <h3 className="text-xl font-bold mb-4">Community</h3>
                <p className="text-gray-600">
                  We believe in building strong relationships with our customers,
                  partners, an d communities. Together, we're creating positive change.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Environmental Impact</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• 2M+ plastic bottles recycled into shoes</li>
                <li>• 50% reduction in carbon footprint since 2020</li>
                <li>• 100% renewable energy in our facilities</li>
                <li>• Zero waste packaging initiative</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold mb-4">Social Impact</h3>
              <ul className="space-y-4 text-gray-600">
                <li>• Fair labor practices across our supply chain</li>
                <li>• Community education programs</li>
                <li>• Partnerships with local environmental initiatives</li>
                <li>• Shoe donation program for those in need</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a"
                alt="Team Member"
                className="rounded-lg mb-4"
              />
              <h3 className="font-bold mb-2">David Chen</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
                alt="Team Member"
                className="rounded-lg mb-4"
              />
              <h3 className="font-bold mb-2">Sarah Johnson</h3>
              <p className="text-gray-600">Head of Sustainability</p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
                alt="Team Member"
                className="rounded-lg mb-4"
              />
              <h3 className="font-bold mb-2">Michael Torres</h3>
              <p className="text-gray-600">Head of Design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}