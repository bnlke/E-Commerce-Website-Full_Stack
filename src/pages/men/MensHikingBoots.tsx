import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const hikingBoots = products.filter(product => 
  product.category === 'mens-hiking' || 
  (product.tags?.includes('men') && product.tags?.includes('hiking'))
);

export default function MensHikingBoots() {
  return (
    <ShoeLayout
      products={hikingBoots}
      title="Men's Hiking Boots"
      description="Conquer any terrain with our premium hiking boots. Built for durability and comfort while maintaining our commitment to sustainability."
    />
  );
}