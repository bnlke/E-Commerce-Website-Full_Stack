import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../hooks/useScrollToTop';

const navigation = {
  shop: [
    { name: 'Men', href: '/category/men' },
    { name: 'Women', href: '/category/women' },
    { name: 'Kids', href: '/category/kids' },
    { name: 'Accessories', href: '/category/accessories' },
    { name: 'Sale', href: '/sale' },
  ],
  support: [
    { name: 'FAQs', href: '/faqs' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Shipping & Returns', href: '/shipping' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@ROMusic-n4o' },
];

export default function Footer() {
  const navigate = useNavigate();
  useScrollToTop();

  const handleNavigation = (href: string) => {
    navigate(href);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Contact Information */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <div className="logo text-white text-4xl">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white">Wear</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">X</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white">press</span>
              </div>
            </Link>
            <div className="space-y-4 text-gray-300">
              <p className="flex items-center">
                <MapPin className="w-5 h-5 mr-3" />
                <a href="https://maps.google.com/?q=123+Fashion+Street+New+York+NY+10001" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  123 Fashion Street, 10001 New York, USA
                </a>
              </p>
              <p className="flex items-center">
                <Phone className="w-5 h-5 mr-3" />
                <a href="tel:+15551234567" className="hover:text-white transition-colors">
                  +1 (555) 123-4567
                </a>
              </p>
              <p className="flex items-center">
                <Mail className="w-5 h-5 mr-3" />
                <a href="mailto:support@wearxpress.com" className="hover:text-white transition-colors">
                  support@wearxpress.com
                </a>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {navigation.shop.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Legal */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-sm text-gray-400">
              {navigation.legal.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="hover:text-white transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-center text-gray-400 text-sm mt-8">
            © {new Date().getFullYear()} WearXpress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}