import CategoryLayout from '../components/CategoryLayout';
import { saleCategories } from '../utils/categoryData';

const featuredItems = [
  {
    title: "UP TO 50% OFF",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2",
    link: "/sale/men"
  },
  {
    title: "CLEARANCE SALE",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de",
    link: "/sale/women"
  }
];

export default function CategorySale() {
  return <CategoryLayout categories={saleCategories} featuredItems={featuredItems} />;
}