import HeroSlider from '../components/HeroSlider';
import { ArrowRight, Mail, Star, Truck, ShieldCheck, Leaf } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import Newsletter from '../components/Newsletter';
import QuickView from '../components/QuickView';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

const categories = [
  {
    id: 'men',
    name: "Men's Collection",
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb'
  },
  {
    id: 'women',
    name: "Women's Collection",
    image: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95'
  },
  {
    id: 'kids',
    name: "Kids' Collection",
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2'
  }
];

const collections = [
  {
    title: "Sustainable Collection",
    description: "Made with eco-friendly materials",
    image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1",
    link: "/collections/sustainable"
  },
  {
    title: "Limited Edition",
    description: "Exclusive designs for a limited time",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
    link: "/collections/limited-edition"
  },
  {
    title: "Collaborations",
    description: "Special artist collaborations",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    link: "/collections/collaborations"
  }
];

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over €50"
  },
  {
    icon: ShieldCheck,
    title: "100-Day Trial",
    description: "Risk-free returns"
  },
  {
    icon: Leaf,
    title: "Sustainable",
    description: "Eco-friendly materials"
  },
  {
    icon: Star,
    title: "5-Star Rated",
    description: "By our customers"
  }
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchFeaturedProducts() {
    try {
      // Fetch specific products by slug
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            name
          ),
          product_sizes (
            size,
            stock_quantity
          )
        `)
        .in('slug', ['nike-air-force-1', 'nike-12']);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFeaturedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  }

  fetchFeaturedProducts();
}, []);

  return (
    <div className="pt-20">
      <HeroSlider />
      
      {/* Categories */}
      <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-2 text-center">Discover Your Style</h2>
        <p className="text-gray-600 text-center mb-12">Explore our curated collections for every occasion</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb"
              alt="Men's Collection"
              className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-2xl font-bold mb-4">Men's Collection</h3>
                <Link
                  to="/product/wool-runner-go"
                  className="inline-flex items-center space-x-2 bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1535043934128-cf0b28d52f95"
              alt="Women's Collection"
              className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-2xl font-bold mb-4">Women's Collection</h3>
                <Link 
                  to="/collections/new"
                  className="inline-flex items-center space-x-2 bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2"
              alt="Kids' Collection"
              className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-2xl font-bold mb-4">Kids' Collection</h3>
                <a 
                  href="/collections/kids"
                  className="inline-flex items-center space-x-2 bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>


      {/* Sustainability Banner */}
      <section className="py-8 px-4">
        <div className="relative rounded-xl overflow-hidden container mx-auto">
          <img
            src="https://images.unsplash.com/photo-1606567595334-d39972c85dbe"
            alt="Sustainable Fashion"
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">WE MAKE BETTER THINGS IN A BETTER WAY</h3>
              <p className="text-lg md:text-xl max-w-2xl mx-auto">
                By looking to the world's greatest innovator—Nature—we create shoes that deliver
                unrivalled comfort that you feel good in and feel good about.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Featured Products</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {featuredProducts.map((product) => {
                return (
                  <div key={product.id} className="group">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button 
                        onClick={() => setSelectedProduct(product)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Quick View
                      </button>
                    </div>
                    <h3 className="text-lg font-medium text-center">{product.name}</h3>
                    <p className="text-gray-600 text-center">${product.price}</p>
                    
                    {product.product_sizes && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {product.product_sizes.map(size => (
                          <div key={size.size} className="relative">
                            <span className={`text-xs px-2 py-1 border rounded ${
                              size.stock_quantity === 0 
                                ? 'border-gray-200 text-gray-400 bg-gray-50' 
                                : size.stock_quantity <= 3 
                                  ? 'border-red-200 text-red-600 bg-red-50'
                                  : 'border-gray-200 text-gray-600'
                            }`}>
                              {size.size}
                              {size.stock_quantity <= 3 && size.stock_quantity > 0 && (
                                <span className="absolute -top-1 -right-1 text-[10px] bg-red-100 text-red-600 px-1 rounded-full">
                                  {size.stock_quantity}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Collections */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-center">Special Collections</h2>
          <p className="text-gray-600 text-center mb-12">Discover our unique and limited edition collections</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-2">{collection.title}</h3>
                    <p className="mb-4 text-gray-200">{collection.description}</p>
                    <Link 
                      to={collection.link}
                      className="bg-white text-black px-6 py-2 rounded inline-flex items-center space-x-2 mx-auto hover:bg-gray-100 transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-gray-800" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* The Approach Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">The WearXpress Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Comfort Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Wear-All-Day Comfort</h3>
              <p className="text-gray-600 mb-6">
                Lightweight, bouncy, and wildly comfortable, our shoes make any outing feel effortless. 
                Slip in, lace up, or slide them on and enjoy the comfy support.
              </p>
              <Link to="/approach/comfort" className="text-black font-medium hover:underline">
                Learn More
              </Link>
            </div>

            {/* Sustainability Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Sustainability In Every Step</h3>
              <p className="text-gray-600 mb-6">
                From materials to transport, we're working to reduce our carbon footprint to near zero. 
                Holding ourselves accountable and striving for climate goals isn't a 30-year goal—it's now.
              </p>
              <Link to="/approach/sustainability" className="text-black font-medium hover:underline">
                Learn More
              </Link>
            </div>

            {/* Materials Card */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold mb-4">Materials From The Earth</h3>
              <p className="text-gray-600 mb-6">
                We replace petroleum-based synthetics with natural alternatives wherever we can. 
                Like using wool, tree fiber, and sugar cane. They're soft, breathable, and better 
                for the planet—win, win, win.
              </p>
              <Link to="/approach/materials" className="text-black font-medium hover:underline">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}