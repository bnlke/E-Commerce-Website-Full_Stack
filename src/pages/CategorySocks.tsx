import CategoryLayout from '../components/CategoryLayout';
import { sockCategories } from '../utils/categoryData';

const featuredItems = [
  {
    title: "PERFORMANCE COLLECTION",
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111",
    link: "/category/socks/performance"
  },
  {
    title: "SUSTAINABLE COMFORT",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82",
    link: "/category/socks/sustainable"
  }
];

export default function CategorySocks() {
  return <CategoryLayout categories={sockCategories} featuredItems={featuredItems} />;
}