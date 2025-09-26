import ShoeLayout from '../../components/ShoeLayout';
import products from '../../utils/productData';
import { Link } from 'react-router-dom';

// Get items with special offers (20% or more discount)
const specialOfferItems = products
  .filter(product => {
    // Include items with significant discounts
    if (product.originalPrice) {
      const discountPercentage = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return discountPercentage >= 20;
    }
    return false;
  })
  .map(product => ({
    ...product,
    tags: [...(product.tags || []), 'special-offer']
  }));

// Sort by highest discount first
const sortedSpecialOffers = specialOfferItems.sort((a, b) => {
  const discountA = ((a.originalPrice! - a.price) / a.originalPrice!) * 100;
  const discountB = ((b.originalPrice! - b.price) / b.originalPrice!) * 100;
  return discountB - discountA;
});

export default function SpecialOffer() {
  return (
    <ShoeLayout
      products={sortedSpecialOffers}
      title="Special Offer - 20% Off Selected Items" 
      description="Limited time offer! Discover our curated selection of premium footwear and accessories at 20% off or more. Don't miss out on these exceptional deals on sustainable and comfortable styles."
      error={sortedSpecialOffers.length === 0 ? "We're currently updating our special offers collection." : null}
    />
  );
}