import ShoeLayout from '../../../components/ShoeLayout';
import products from '../../../utils/productData';

const littleKidsShoes = products.filter(product => 
  product.category === 'kids-little' || 
  (product.tags?.includes('kids') && product.tags?.includes('little-kids'))
);

export default function KidsLittle() {
  return (
    <ShoeLayout
      products={littleKidsShoes}
      title="Little Kids' Shoes (4-8 Years)"
      description="Shoes designed for growing kids who love to play and explore. Featuring durable materials and fun designs perfect for school and play."
    />
  );
}