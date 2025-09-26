import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const casualShoes = products.filter(product => 
  product.category === 'mens-casual' || 
  (product.tags?.includes('men') && product.tags?.includes('casual'))
);

export default function MensCasualShoes() {
  return (
    <ShoeLayout
      products={casualShoes}
      title="Men's Casual Shoes"
      description="Effortlessly stylish casual shoes for everyday wear. From loafers to slip-ons, find your perfect pair for any occasion."
    />
  );
}