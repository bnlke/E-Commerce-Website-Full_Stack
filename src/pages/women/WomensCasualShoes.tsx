import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const casualShoes = products.filter(product => 
  product.category === 'womens-casual' || 
  (product.tags?.includes('women') && product.tags?.includes('casual'))
);

export default function WomensCasualShoes() {
  return (
    <ShoeLayout
      products={casualShoes}
      title="Women's Casual Shoes"
      description="Effortlessly stylish casual shoes designed for everyday comfort. From classic flats to modern slip-ons, find your perfect pair for any occasion."
    />
  );
}