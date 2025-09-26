import ProductGrid from '../../components/ProductGrid';
import products from '../../utils/productData';

const saleProducts = products.filter(product => 
  product.category === 'womens-sale' || 
  (product.tags?.includes('women') && product.tags?.includes('sale'))
);

export default function WomensSale() {
  return (
    <ProductGrid
      products={saleProducts}
      title="Women's Sale"
      description="Up to 40% off women's footwear. Don't miss out on these amazing deals."
    />
  );
}