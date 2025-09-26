import CategoryLayout from '../components/CategoryLayout';
import { kidsCategories } from '../utils/categoryData';

const featuredItems = [
  {
    title: "BACK TO SCHOOL",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
    link: "/category/kids/back-to-school"
  },
  {
    title: "SUMMER FUN",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2",
    link: "/category/kids/summer"
  }
];

export default function CategoryKids() {
  return <CategoryLayout categories={kidsCategories} featuredItems={featuredItems} />;
}