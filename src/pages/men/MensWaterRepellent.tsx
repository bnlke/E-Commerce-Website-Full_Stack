import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const waterRepellentShoes = products.filter(product => 
  product.category === 'mens-water-repellent' || 
  (product.tags?.includes('men') && product.tags?.includes('water-repellent'))
);

export default function MensWaterRepellent() {
  return (
    <ShoeLayout
      products={waterRepellentShoes}
      title="Men's Water-Repellent Shoes"
      description="Stay dry and comfortable in any weather. Our water-repellent collection features advanced weather protection without compromising on style."
    />
  );
}