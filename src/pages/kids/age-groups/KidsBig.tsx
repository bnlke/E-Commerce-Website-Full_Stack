import ShoeLayout from '../../../components/ShoeLayout';
import products from '../../../utils/productData';

const bigKidsShoes = products.filter(product => 
  product.category === 'kids-big' || 
  (product.tags?.includes('kids') && product.tags?.includes('big-kids'))
);

export default function KidsBig() {
  return (
    <ShoeLayout
      products={bigKidsShoes}
      title="Big Kids' Shoes (9-12 Years)"
      description="Shoes designed for older kids with style and performance in mind. Perfect for sports, school, and everyday activities."
    />
  );
}