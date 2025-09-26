import ShoeLayout from '../../../components/ShoeLayout';
import products from '../../../utils/productData';

const toddlerShoes = products.filter(product => 
  product.category === 'kids-toddler' || 
  (product.tags?.includes('kids') && product.tags?.includes('toddler'))
);

export default function KidsToddler() {
  return (
    <ShoeLayout
      products={toddlerShoes}
      title="Toddler Shoes (1-3 Years)"
      description="Specially designed shoes for our littlest explorers. Featuring soft materials, flexible soles, and easy-on designs perfect for growing feet."
    />
  );
}