import CategoryLayout from '../components/CategoryLayout';
import { accessoryCategories } from '../utils/categoryData';

const featuredItems = [
  {
    title: "TRAVEL COLLECTION",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    link: "/category/accessories/travel"
  },
  {
    title: "ESSENTIAL ACCESSORIES",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
    link: "/category/accessories/essentials"
  }
];

export default function CategoryAccessories() {
  return <CategoryLayout categories={accessoryCategories} featuredItems={featuredItems} />;
}