import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';
import { Link } from 'react-router-dom';

// Get all sale items across categories
const saleItems = products.filter(product => 
  product.tags?.includes('sale') || 
  product.category.includes('sale') ||
  (product.originalPrice && product.price < product.originalPrice) // Items with discounted prices
).map(product => ({
  ...product,
  tags: [...(product.tags || []), 'sale'] // Add sale tag if not present
}));

// Sort by discount percentage
const sortedSaleItems = saleItems.sort((a, b) => {
  const discountA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
  const discountB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
  return discountB - discountA;
});

export default function Sale() {
  return (
    <ShoeLayout
      products={sortedSaleItems}
      title="Sale Collection" 
      description="Discover incredible deals on premium footwear and accessories. Limited time offers on our sustainable and comfortable styles."
      error={sortedSaleItems.length === 0 ? "We're currently updating our sale collection." : null}
    />
  );
}