import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const lifestyleShoes = products.filter(product => 
  product.category === 'womens-lifestyle' || 
  (product.tags?.includes('women') && product.tags?.includes('lifestyle'))
);

export default function WomensLifestyle() {
  return (
    <ShoeLayout
      products={lifestyleShoes}
      title="Women's Lifestyle Sneakers"
      description="Fashionable and comfortable sneakers for everyday wear. Our lifestyle collection combines trendy designs with sustainable materials."
    />
  );
}