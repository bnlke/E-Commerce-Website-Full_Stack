import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const kidsProducts = products.filter(product => 
  product.tags?.includes('kids') && 
  !product.tags?.includes('sale')
).slice(0, 12); // Limit to 12 featured products

export default function KidsCollection() {
  return (
    <ShoeLayout
      products={kidsProducts}
      title="Kids' Collection"
      description="Fun and functional footwear for growing feet. Our kids' collection features durable materials, playful designs, and comfortable fits for all ages."
    />
  );
}