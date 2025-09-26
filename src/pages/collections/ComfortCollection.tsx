import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const comfortProducts = products.filter(product => 
  product.description.toLowerCase().includes('comfort') || 
  product.tags?.includes('comfort')
).slice(0, 12); // Limit to 12 featured products

export default function ComfortCollection() {
  return (
    <ShoeLayout
      products={comfortProducts}
      title="Step into Comfort"
      description="Experience unparalleled comfort with our collection of sustainable and comfortable footwear. Each pair is designed to provide all-day support while maintaining our commitment to eco-friendly materials."
    />
  );
}