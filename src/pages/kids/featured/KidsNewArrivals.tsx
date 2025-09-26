import ShoeLayout from '../../../components/ShoeLayout';
import products from '../../../utils/productData';

const newArrivals = products.filter(product => 
  product.category === 'kids-new' || 
  (product.tags?.includes('kids') && product.tags?.includes('new'))
);

export default function KidsNewArrivals() {
  return (
    <ShoeLayout
      products={newArrivals}
      title="Kids' New Arrivals"
      description="Discover our latest kids' shoe collection featuring innovative designs, sustainable materials, and playful styles."
    />
  );
}