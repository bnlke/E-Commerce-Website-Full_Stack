import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const collaborationProducts = products.filter(product => 
  product.tags?.includes('artist') || 
  product.description.toLowerCase().includes('collaboration') ||
  product.description.toLowerCase().includes('artist series')
).slice(0, 12); // Limit to 12 featured products

export default function Collaborations() {
  return (
    <ShoeLayout
      products={collaborationProducts}
      title="Artist Collaborations"
      description="Discover our special artist collaboration series. Each piece represents a unique fusion of sustainable fashion and artistic expression."
    />
  );
}