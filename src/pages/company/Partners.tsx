const partners = [
  {
    category: 'Manufacturing',
    companies: [
      {
        name: 'EcoFab Industries',
        location: 'Portland, OR',
        description: 'Sustainable manufacturing facility specializing in eco-friendly footwear production.',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902'
      },
      {
        name: 'GreenTech Materials',
        location: 'Seattle, WA',
        description: 'Innovative materials supplier focusing on recycled and sustainable components.',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4'
      }
    ]
  },
  {
    category: 'Retail',
    companies: [
      {
        name: 'Urban Outfitters',
        location: 'Multiple Locations',
        description: 'Leading retail partner with nationwide presence.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'
      },
      {
        name: 'EcoStyle Boutiques',
        location: 'Various Cities',
        description: 'Sustainable fashion boutiques featuring curated collections.',
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04'
      }
    ]
  },
  {
    category: 'Technology',
    companies: [
      {
        name: 'CloudTech Solutions',
        location: 'San Francisco, CA',
        description: 'Cloud infrastructure and e-commerce technology provider.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa'
      },
      {
        name: 'Digital Innovation Labs',
        location: 'Austin, TX',
        description: 'Digital experience and mobile app development partner.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
      }
    ]
  }
];

const benefits = [
  {
    title: 'Brand Exposure',
    description: 'Access to our growing customer base and marketing channels.'
  },
  {
    title: 'Innovation',
    description: 'Collaborate on sustainable technology and material development.'
  },
  {
    title: 'Growth',
    description: 'Expand your business through our global distribution network.'
  },
  {
    title: 'Support',
    description: 'Dedicated partner success team and resources.'
  }
];

export default function Partners() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partner With Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our network of innovative partners who are helping us revolutionize
            the footwear industry through sustainable practices and cutting-edge technology.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 text-center">
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Partners Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12">Our Partners</h2>
          {partners.map((category, index) => (
            <div key={index} className="mb-16">
              <h3 className="text-2xl font-bold mb-8">{category.category} Partners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.companies.map((company, companyIndex) => (
                  <div key={companyIndex} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img
                      src={company.image}
                      alt={company.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{company.name}</h4>
                      <p className="text-gray-500 text-sm mb-4">{company.location}</p>
                      <p className="text-gray-600">{company.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Process */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Partnership Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Initial Contact</h3>
              <p className="text-gray-600">Submit your partnership inquiry</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Evaluation</h3>
              <p className="text-gray-600">Review of partnership opportunity</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Discussion</h3>
              <p className="text-gray-600">Deep dive into collaboration details</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold mb-2">Launch</h3>
              <p className="text-gray-600">Begin our partnership journey</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Become a Partner</h2>
          <p className="text-gray-600 mb-8">
            Interested in partnering with us? We'd love to hear from you and
            explore potential collaboration opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}