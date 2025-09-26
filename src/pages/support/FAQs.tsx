import { useState } from 'react';
import { ChevronDown, ChevronUp, ShoppingCart, CreditCard, Package, HelpCircle, Truck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    category: 'Orders & Shipping',
    icon: Truck,
    color: 'bg-blue-50 text-blue-600',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to most countries worldwide. Shipping times and costs vary by location.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes, you\'ll receive a tracking number via email once your order ships.'
      }
    ]
  },
  {
    category: 'Returns & Exchanges',
    icon: RefreshCw,
    color: 'bg-green-50 text-green-600',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer free returns within 30 days of purchase. Items must be unworn and in original condition with tags attached.'
      },
      {
        question: 'How do I start a return?',
        answer: 'Log into your account and visit the Orders section to initiate a return. You\'ll receive a prepaid shipping label via email.'
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive your return.'
      }
    ]
  },
  {
    category: 'Product Information',
    icon: Package,
    color: 'bg-purple-50 text-purple-600',
    questions: [
      {
        question: 'How do I find my size?',
        answer: 'Check our size guide for detailed measurements. If you\'re between sizes, we recommend sizing up.'
      },
      {
        question: 'Are your products sustainable?',
        answer: 'Yes, we use eco-friendly materials and sustainable manufacturing processes for all our products.'
      },
      {
        question: 'How should I care for my shoes?',
        answer: 'Most of our shoes are machine washable on a gentle cycle with cold water. Remove laces before washing and air dry away from direct heat.'
      }
    ]
  },
  {
    category: 'Account & Payment',
    icon: CreditCard,
    color: 'bg-amber-50 text-amber-600',
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, and Apple Pay.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and follow the instructions sent to your email.'
      }
    ]
  }
];

export default function FAQs() {
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const toggleQuestion = (question: string) => {
    setOpenQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more.
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>
        
        {/* FAQ Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {faqs.map(category => {
            const Icon = category.icon;
            return (
              <div 
                key={category.category} 
                className={`${category.color} p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => document.getElementById(category.category)?.scrollIntoView({ behavior: 'smooth' })}
              >
                <div className="flex items-center mb-3">
                  <Icon className="w-6 h-6 mr-2" />
                  <h3 className="font-bold">{category.category}</h3>
                </div>
                <p className="text-sm opacity-80">
                  {category.questions.length} questions
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-12">
          {faqs.map(category => (
            <div key={category.category} id={category.category} className="scroll-mt-40">
              <div className="flex items-center mb-6">
                <category.icon className={`w-8 h-8 mr-3 ${category.color.split(' ')[1]}`} />
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>
              <div className="space-y-4">
                {category.questions.map(({ question, answer }) => (
                  <div
                    key={question}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleQuestion(question)}
                      className={`w-full flex items-center justify-between p-4 text-left ${
                        openQuestions.includes(question) ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{question}</span>
                      {openQuestions.includes(question) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {openQuestions.includes(question) && (
                      <div className="p-5 bg-gray-50 border-t">
                        <p className="text-gray-700 leading-relaxed">{answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
              <HelpCircle className="w-12 h-12 mb-4" />
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="mb-6">
                Our customer service team is available to assist you with any questions you might have.
              </p>
              <div className="space-y-3 mb-6">
                <p className="flex items-center"><span className="w-6 h-6 rounded-full bg-white text-gray-800 flex items-center justify-center mr-2 text-xs font-bold">@</span> support@wearxpress.com</p>
                <p className="flex items-center"><span className="w-6 h-6 rounded-full bg-white text-gray-800 flex items-center justify-center mr-2 text-xs font-bold">☎</span> 1-800-WEAR-XPS</p>
                <p className="flex items-center"><span className="w-6 h-6 rounded-full bg-white text-gray-800 flex items-center justify-center mr-2 text-xs font-bold">⏰</span> Monday-Friday, 9am-5pm EST</p>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-800 p-8 hidden md:block">
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4">Popular Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/shipping" className="flex items-center text-gray-300 hover:text-white">
                      <Truck className="w-5 h-5 mr-2" />
                      <span>Shipping & Delivery</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/size-guide" className="flex items-center text-gray-300 hover:text-white">
                      <Package className="w-5 h-5 mr-2" />
                      <span>Size Guide</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="flex items-center text-gray-300 hover:text-white">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      <span>Help Center</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}