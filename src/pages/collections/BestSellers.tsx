import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';
import { Link } from 'react-router-dom';

// Get best sellers across all categories
const bestSellers = products.filter(product => 
  product.tags?.includes('best-sellers') || 
  product.description.toLowerCase().includes('best seller') ||
  product.category.includes('best-sellers') ||
  (product.originalPrice && product.price < product.originalPrice) // Popular items on sale
).map(product => ({
  ...product,
  tags: [...(product.tags || []), 'best-seller'] // Add best-seller tag if not present
}));

// Sort by price to show premium items first
const sortedBestSellers = bestSellers.sort((a, b) => b.price - a.price);

export default function BestSellers() {
  return (
    <ShoeLayout
      products={sortedBestSellers}
      title="Best Sellers Collection" 
      description="Discover our most-loved styles across all categories. From premium footwear to sustainable accessories, these customer favorites combine comfort, style, and innovation."
      error={sortedBestSellers.length === 0 ? "We're currently updating our best sellers collection." : null}
    />
  );
}