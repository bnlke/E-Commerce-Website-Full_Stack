import { useState } from 'react';
import { sizeGuides } from '../../utils/sizeCharts';
import SizeChart from '../../components/SizeChart';

const categories = [
  { id: 'shoes', name: 'Shoes' },
  { id: 'clothing', name: 'Apparel' },
  { id: 'socks', name: 'Socks' },
  { id: 'accessories', name: 'Accessories' }
];

const measurementTips = [
  {
    title: 'Foot Measurement',
    steps: [
      'Measure your feet in the afternoon when they are at their largest',
      'Stand while measuring to ensure accurate size',
      'Measure both feet and use the larger measurement',
      'Wear the type of socks you plan to wear with the shoes'
    ]
  },
  {
    title: 'Clothing Measurement',
    steps: [
      'Use a flexible tape measure',
      'Measure over undergarments',
      'Keep the tape measure snug but not tight',
      'Stand naturally when measuring'
    ]
  },
  {
    title: 'General Tips',
    steps: [
      'If between sizes, size up for comfort',
      'Consider your preferred fit (slim, regular, loose)',
      'Check product-specific size recommendations',
      'Review customer feedback for fit information'
    ]
  }
];

export default function SizeGuide() {
  const [selectedCategory, setSelectedCategory] = useState('shoes');

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Size Guide</h1>

        {/* Category Selection */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full border ${
                selectedCategory === category.id
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:border-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Size Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <SizeChart sizeChart={sizeGuides[selectedCategory]} />
        </div>

        {/* Measurement Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {measurementTips.map(tip => (
            <div key={tip.title} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">{tip.title}</h3>
              <ul className="space-y-3">
                {tip.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Need Help Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600">
            For sizing questions, email us at support@wearxpress.com
            or call 1-800-WEAR-XPS during business hours.
          </p>
        </div>
      </div>
    </div>
  );
}