const pressReleases = [
  {
    date: '2024-03-15',
    title: 'WearXpress Launches Revolutionary Sustainable Footwear Line',
    description: 'New collection features innovative materials made from recycled ocean plastics.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
  },
  {
    date: '2024-02-28',
    title: 'Company Achieves Carbon Neutral Status',
    description: 'Major milestone reached in our sustainability journey through various initiatives.',
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e'
  },
  {
    date: '2024-01-15',
    title: 'WearXpress Expands to European Market',
    description: 'New distribution centers opened in key European locations to serve growing demand.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'
  }
];

const mediaKit = [
  {
    title: 'Brand Assets',
    items: [
      'Logo Package',
      'Brand Guidelines',
      'Product Images',
      'Company Photos'
    ]
  },
  {
    title: 'Company Information',
    items: [
      'Fact Sheet',
      'Executive Bios',
      'Company History',
      'Mission Statement'
    ]
  },
  {
    title: 'Statistics & Reports',
    items: [
      'Impact Report',
      'Growth Metrics',
      'Sustainability Data',
      'Market Research'
    ]
  }
];

const mediaContacts = [
  {
    name: 'Sarah Johnson',
    title: 'Head of PR & Communications',
    email: 'press@wearxpress.com',
    phone: '+1 (555) 123-4567'
  },
  {
    name: 'Michael Chen',
    title: 'Media Relations Manager',
    email: 'media@wearxpress.com',
    phone: '+1 (555) 234-5678'
  }
];

export default function Press() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Press & Media</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the latest news and updates about WearXpress's journey in
            revolutionizing sustainable footwear.
          </p>
        </div>

        {/* Latest News Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12">Latest News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={release.image}
                  alt={release.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <p className="text-gray-500 text-sm mb-2">
                    {new Date(release.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <h3 className="text-xl font-bold mb-4">{release.title}</h3>
                  <p className="text-gray-600 mb-4">{release.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Kit Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12">Media Kit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mediaKit.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <span className="w-2 h-2 bg-black rounded-full mr-3" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 text-black font-medium hover:underline">
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Media Contacts Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-12">Media Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mediaContacts.map((contact, index) => (
              <div key={index} className="bg-white rounded-lg p-8 border hover:border-black transition-colors">
                <h3 className="text-xl font-bold mb-2">{contact.name}</h3>
                <p className="text-gray-600 mb-4">{contact.title}</p>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Email:{' '}
                    <a href={`mailto:${contact.email}`} className="text-black hover:underline">
                      {contact.email}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    Phone:{' '}
                    <a href={`tel:${contact.phone}`} className="text-black hover:underline">
                      {contact.phone}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Press Inquiry Section */}
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Press Inquiries</h2>
          <p className="text-gray-600 mb-8">
            For press inquiries, interview requests, or additional information,
            please email our media relations team at press@wearxpress.com.
          </p>
        </div>
      </div>
    </div>
  );
}