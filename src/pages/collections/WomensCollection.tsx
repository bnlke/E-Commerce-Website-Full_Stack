import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const womensProducts = products.filter(product => 
  product.tags?.includes('women') && 
  !product.tags?.includes('sale')
).slice(0, 12); // Limit to 12 featured products

export default function WomensCollection() {
  return (
    <ShoeLayout
      products={womensProducts}
      title="Women's Collection"
      description="Explore our women's collection combining style with sustainability. From active shoes to casual comfort, discover footwear designed for every moment."
    />
  );
}