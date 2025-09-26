import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';
import { Link } from 'react-router-dom';

// Get new arrivals across all categories
const newArrivals = products.filter(product => 
  product.tags?.includes('new') || 
  product.description.toLowerCase().includes('new arrival') ||
  product.category.includes('new') ||
  // Include items with higher prices as they're often newer releases
  product.price > 150
).map(product => ({
  ...product,
  tags: [...(product.tags || []), 'new-arrival'] // Add new-arrival tag if not present
}));

// Sort by price descending to show premium new items first
const sortedNewArrivals = newArrivals.sort((a, b) => b.price - a.price);

export default function NewArrivals() {
  return (
    <ShoeLayout
      products={sortedNewArrivals}
      title="New Arrivals Collection" 
      description="Be the first to discover our latest releases. From innovative designs to sustainable materials, explore our newest styles that combine fashion with function."
      error={sortedNewArrivals.length === 0 ? "We're currently updating our new arrivals collection." : null}
    />
  );
}