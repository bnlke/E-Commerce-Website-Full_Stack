import CategoryLayout from '../components/CategoryLayout';
import { womenCategories } from '../utils/categoryData';

const featuredItems = [
  {
    title: "SPRING ESSENTIALS",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
    link: "/category/women/spring",
  },
  {
    title: "ACTIVE COLLECTION",
    image: "https://images.unsplash.com/photo-1536337005238-94b997371b40",
    link: "/category/women/activewear"
  }
];

export default function CategoryWomen() {
  return <CategoryLayout categories={womenCategories} featuredItems={featuredItems} />;
}