import { useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { getProductBySlug } from '../../utils/productData';
import ImageWithFallback from '../../components/ImageWithFallback';

export default function ProductDetails() {
  const { slug } = useParams();
  const { dispatch } = useCart();
  const product = getProductBySlug(slug || '');
  const [selectedSize, setSelectedSize] = useState('One Size');

  if (!product) {
    return (
      <div className="pt-36 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl">Product not found</h1>
        </div>
      </div>
    );
  }

  const addToCart = () => {
    // Create a product object with the selected size
    const productWithSize = {
      ...product,
      size: selectedSize
    };
    
    dispatch({ type: 'ADD_ITEM', payload: productWithSize });
  };

  return (
    <div className="pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl mb-6">${product.price}</p>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            {/* Size Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">SIZE:</h3>
              <div className="grid grid-cols-3 gap-2">
                {['S', 'M', 'L'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border rounded-md text-sm font-medium transition-colors
                      ${selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-900'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={addToCart}
              className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}