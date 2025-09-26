import { Truck, Package, RefreshCw, Clock } from 'lucide-react';

const shippingMethods = [
  {
    name: 'Standard Shipping',
    time: '3-5 business days',
    price: 'Free over $50',
    description: 'Available for all orders within the continental US'
  },
  {
    name: 'Express Shipping',
    time: '2-3 business days',
    price: '$15',
    description: 'Faster delivery for when you need it sooner'
  },
  {
    name: 'Next Day Delivery',
    time: 'Next business day',
    price: '$25',
    description: 'Order by 2pm for next day delivery'
  },
  {
    name: 'International Shipping',
    time: '7-14 business days',
    price: 'Varies by location',
    description: 'Available for most countries worldwide'
  }
];

const returnInfo = [
  {
    icon: Package,
    title: 'Free Returns',
    description: 'Return shipping is always on us within the continental US'
  },
  {
    icon: Clock,
    title: '30-Day Window',
    description: 'You have 30 days to return your items from the delivery date'
  },
  {
    icon: RefreshCw,
    title: 'Easy Process',
    description: 'Start your return online and print a free shipping label'
  }
];

export default function Shipping() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Shipping & Returns</h1>

        {/* Free Shipping Banner */}
        <div className="bg-black text-white rounded-lg p-8 mb-12 text-center">
          <Truck className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Free Shipping on Orders Over $50</h2>
          <p className="text-gray-300">
            Plus, enjoy free returns on all orders within the continental US
          </p>
        </div>

        {/* Shipping Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingMethods.map(method => (
              <div
                key={method.name}
                className="border rounded-lg p-6 hover:border-black transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{method.name}</h3>
                    <p className="text-gray-600">{method.time}</p>
                  </div>
                  <span className="font-bold">{method.price}</span>
                </div>
                <p className="text-gray-600">{method.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Returns Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Returns Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {returnInfo.map(info => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="text-center">
                  <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{info.title}</h3>
                  <p className="text-gray-600">{info.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Return Policy Details */}
        <section className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Return Policy Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Eligibility</h3>
              <p className="text-gray-600">
                Items must be unworn and in original condition with all tags attached.
                Returns must be initiated within 30 days of delivery.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Process</h3>
              <p className="text-gray-600">
                1. Log into your account and visit the Orders section<br />
                2. Select the items you wish to return<br />
                3. Print the prepaid shipping label<br />
                4. Drop off your package at any authorized shipping location
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Refunds</h3>
              <p className="text-gray-600">
                Refunds will be issued to the original form of payment within 5-7
                business days after we receive your return.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            For questions about shipping or returns, email us at support@wearxpress.com
            or call 1-800-WEAR-XPS during business hours.
          </p>
        </section>
      </div>
    </div>
  );
}