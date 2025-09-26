import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const springProducts = products.filter(product => 
  (product.tags?.includes('women') && !product.tags?.includes('sale')) || 
  product.category === 'womens-trainers' || 
  product.category === 'womens-lifestyle'
).slice(0, 8); // Limit to 8 products for featured collection

export default function WomensSpring() {
  return (
    <ShoeLayout
      products={springProducts}
      title="Women's Spring Essentials"
      description="Step into spring with our curated collection of lightweight and breathable shoes. From casual sneakers to active styles, discover the perfect pair for the new season."
    />
  );
}