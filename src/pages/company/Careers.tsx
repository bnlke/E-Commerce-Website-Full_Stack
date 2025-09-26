import { useState } from 'react';
import { Search } from 'lucide-react';

const departments = [
  'All Departments',
  'Engineering',
  'Design',
  'Marketing',
  'Operations',
  'Customer Service',
  'Sales'
];

const locations = [
  'All Locations',
  'New York, NY',
  'San Francisco, CA',
  'London, UK',
  'Remote'
];

const jobListings = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Join our engineering team to build the future of sustainable e-commerce.'
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Create beautiful and intuitive designs for our digital products.'
  },
  {
    id: 3,
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead our marketing initiatives and grow our brand presence.'
  },
  {
    id: 4,
    title: 'Customer Success Representative',
    department: 'Customer Service',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Help our customers have the best possible experience with our products.'
  },
  {
    id: 5,
    title: 'Operations Coordinator',
    department: 'Operations',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Ensure smooth operations across our supply chain and logistics.'
  }
];

const benefits = [
  {
    title: 'Health & Wellness',
    items: [
      'Comprehensive health insurance',
      'Dental and vision coverage',
      'Mental health support',
      'Gym membership stipend'
    ]
  },
  {
    title: 'Time Off',
    items: [
      'Unlimited PTO',
      'Paid parental leave',
      'Paid volunteer time',
      'Company holidays'
    ]
  },
  {
    title: 'Growth',
    items: [
      'Learning & development budget',
      'Conference attendance',
      'Mentorship programs',
      'Career development planning'
    ]
  }
];

export default function Careers() {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobListings.filter(job => {
    const matchesDepartment = selectedDepartment === 'All Departments' || job.department === selectedDepartment;
    const matchesLocation = selectedLocation === 'All Locations' || job.location === selectedLocation;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDepartment && matchesLocation && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize the footwear industry through sustainable innovation.
            We're looking for passionate individuals to join our mission.
          </p>
        </div>

        {/* Job Search Section */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div
                key={job.id}
                className="border rounded-lg p-6 hover:border-black transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                    <div className="space-x-4">
                      <span className="text-gray-600">{job.department}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{job.location}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-600">{job.type}</span>
                    </div>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </div>
                <p className="text-gray-600">{job.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map(benefit => (
              <div key={benefit.title} className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <ul className="space-y-3">
                  {benefit.items.map((item, index) => (
                    <li key={index} className="text-gray-600">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Culture Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold mb-6">Our Culture</h2>
          <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
            We believe in fostering a culture of innovation, sustainability, and
            inclusivity. Our team is passionate about making a positive impact
            through our work.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
              alt="Team collaboration"
              className="rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4"
              alt="Office space"
              className="rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902"
              alt="Team meeting"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Application Process */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Application Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold mb-2">Apply</h3>
              <p className="text-gray-600">Submit your application online</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold mb-2">Review</h3>
              <p className="text-gray-600">Initial application review</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold mb-2">Interview</h3>
              <p className="text-gray-600">Meet with the team</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold mb-2">Offer</h3>
              <p className="text-gray-600">Welcome to the team!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}