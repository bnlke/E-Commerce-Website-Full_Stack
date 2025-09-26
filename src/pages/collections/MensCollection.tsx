import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const mensProducts = products.filter(product => 
  product.tags?.includes('men') && 
  !product.tags?.includes('sale')
).slice(0, 12); // Limit to 12 featured products

export default function MensCollection() {
  return (
    <ShoeLayout
      products={mensProducts}
      title="Men's Collection"
      description="Discover our complete men's collection featuring sustainable materials and innovative designs. From everyday comfort to performance footwear, find your perfect pair."
    />
  );
}