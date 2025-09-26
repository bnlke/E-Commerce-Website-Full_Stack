import ShoeLayout from '../../../components/ShoeLayout';
import products from '../../../utils/productData';

const saleItems = products.filter(product => product.category === 'kids-sale');

export default function KidsSale() {
  return (
    <ShoeLayout
      products={saleItems}
      title="Kids' Sale"
      description="Great deals on quality kids' shoes. Find the perfect pair at amazing prices."
    />
  );
}