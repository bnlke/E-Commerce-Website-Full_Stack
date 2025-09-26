import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const trainers = products.filter(product => 
  product.category === 'womens-trainers' || 
  (product.tags?.includes('women') && product.tags?.includes('trainers'))
);

export default function WomensTrainers() {
  return (
    <ShoeLayout
      products={trainers}
      title="Women's Trainers"
      description="Discover our collection of comfortable and stylish trainers designed specifically for women. Each pair combines fashion with function, perfect for both active lifestyles and casual wear."
    />
  );
}