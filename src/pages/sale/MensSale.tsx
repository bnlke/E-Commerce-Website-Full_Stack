import ProductGrid from '../../components/ProductGrid';
import products from '../../utils/productData';

const saleProducts = products.filter(product => 
  product.category === 'mens-sale' || 
  (product.tags?.includes('men') && product.tags?.includes('sale'))
);

export default function MensSale() {
  return (
    <ProductGrid
      products={saleProducts}
      title="Men's Sale"
      description="Save up to 40% on men's footwear. Limited time offers on premium shoes."
    />
  );
}