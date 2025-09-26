import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const sustainableProducts = products.filter(product => 
  product.tags?.includes('sustainable') || 
  product.description.toLowerCase().includes('eco-friendly') ||
  product.description.toLowerCase().includes('sustainable')
).slice(0, 12); // Limit to 12 featured products

export default function SustainableCollection() {
  return (
    <ShoeLayout
      products={sustainableProducts}
      title="Eco-Friendly Collection"
      description="Sustainable fashion for a better tomorrow. Discover our collection of shoes made with eco-friendly materials and responsible manufacturing processes."
    />
  );
}