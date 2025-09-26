import ProductGrid from '../../components/ProductGrid';
import products from '../../utils/productData';

const saleProducts = products.filter(product => 
  product.category === 'kids-sale' || 
  (product.tags?.includes('kids') && product.tags?.includes('sale'))
);

export default function KidsSale() {
  return (
    <ProductGrid
      products={saleProducts}
      title="Kids' Sale"
      description="Save 40% on kids' footwear. Great deals on durable, comfortable shoes for growing feet."
    />
  );
}