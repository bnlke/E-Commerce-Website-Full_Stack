import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';

const limitedProducts = products.filter(product => 
  product.tags?.includes('limited') || 
  product.description.toLowerCase().includes('exclusive') ||
  product.description.toLowerCase().includes('limited')
).slice(0, 12); // Limit to 12 featured products

export default function LimitedEdition() {
  return (
    <ShoeLayout
      products={limitedProducts}
      title="Limited Edition Collection"
      description="Exclusive designs available for a limited time. Each piece in this collection represents unique artistry and innovative design, making every purchase truly special."
    />
  );
}