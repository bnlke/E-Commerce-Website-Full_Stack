import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: 'Products',
    question: 'What materials are used in your shoes?',
    answer: 'Our shoes are made with sustainable materials including merino wool, recycled polyester, and natural rubber. We prioritize eco-friendly materials that provide both comfort and durability.'
  },
  {
    category: 'Products',
    question: 'How do I find my correct size?',
    answer: 'We recommend using our size guide available on each product page. Our shoes typically run true to size, but you can also measure your foot length and compare it to our detailed size chart.'
  },
  {
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination.'
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer free returns within 30 days of purchase. Items must be unworn and in original condition with tags attached. Simply initiate a return through your account or contact customer service.'
  },
  {
    category: 'Care',
    question: 'How should I care for my shoes?',
    answer: 'Most of our shoes are machine washable on a gentle cycle with cold water. Remove laces before washing and air dry away from direct heat. For specific care instructions, refer to the product care guide included with your purchase.'
  },
  {
    category: 'Warranty',
    question: 'Do your products come with a warranty?',
    answer: 'Yes, all our shoes come with a 1-year warranty against manufacturing defects. This covers issues with materials and workmanship under normal wear.'
  }
];

const productInfo = [
  {
    title: 'Sustainable Materials',
    description: 'Our commitment to sustainability starts with our materials. We use responsibly sourced merino wool, recycled polyester, and natural rubber in our products.',
    image: 'https://images.unsplash.com/photo-1581091870598-36ce9bad5c77'
  },
  {
    title: 'Comfort Technology',
    description: 'Every shoe features our innovative cushioning system and breathable materials for all-day comfort.',
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de'
  },
  {
    title: 'Quality Craftsmanship',
    description: 'Our shoes are crafted with attention to detail and undergo rigorous quality testing to ensure durability.',
    image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d'
  }
];

export default function Help() {
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);

  const toggleFAQ = (question: string) => {
    setOpenFAQs(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="pt-36 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Help Center</h1>

        {/* Product Information */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Our Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {productInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <img
                  src={info.image}
                  alt={info.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                  <p className="text-gray-600">{info.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                <div className="space-y-4">
                  {faqs
                    .filter(faq => faq.category === category)
                    .map(faq => (
                      <div
                        key={faq.question}
                        className="border rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.question)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <span className="font-medium">{faq.question}</span>
                          {openFAQs.includes(faq.question) ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {openFAQs.includes(faq.question) && (
                          <div className="p-4 bg-gray-50 border-t">
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Information */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-lg mb-4">
              Our customer service team is available to assist you.
            </p>
            <div className="space-y-2">
              <p>Email: support@wearxpress.com</p>
              <p>Phone: 1-800-WEAR-XPS</p>
              <p>Hours: Monday-Friday, 9am-5pm EST</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}