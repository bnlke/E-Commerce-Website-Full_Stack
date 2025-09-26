import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const summerProducts = products.filter(product => 
  product.tags?.includes('lightweight') || 
  product.description.toLowerCase().includes('breathable') ||
  product.category.includes('active')
).slice(0, 12); // Limit to 12 featured products

export default function SummerCollection() {
  return (
    <ShoeLayout
      products={summerProducts}
      title="Summer Collection"
      description="Light and breathable shoes perfect for your active lifestyle. Our summer collection features innovative materials that keep you cool and comfortable all season long."
    />
  );
}