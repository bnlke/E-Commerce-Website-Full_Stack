import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const runningShoes = products.filter(product => 
  product.category === 'womens-running' || 
  (product.tags?.includes('women') && product.tags?.includes('running'))
);

export default function WomensRunning() {
  return (
    <ShoeLayout
      products={runningShoes}
      title="Women's Running Shoes"
      description="High-performance running shoes designed specifically for women. From daily training to race day, find your perfect running companion."
    />
  );
}