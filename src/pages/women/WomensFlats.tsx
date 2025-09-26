import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const flats = products.filter(product => 
  product.category === 'womens-flats' || 
  (product.tags?.includes('women') && product.tags?.includes('flats'))
);

export default function WomensFlats() {
  return (
    <ShoeLayout
      products={flats}
      title="Women's Flats"
      description="Elegant and comfortable flats for every occasion. From classic ballet flats to modern loafers, our collection combines style with all-day comfort."
    />
  );
}