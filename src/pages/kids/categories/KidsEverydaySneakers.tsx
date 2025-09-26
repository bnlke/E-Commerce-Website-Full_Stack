import ProductGrid from '../../../components/ProductGrid';

const products = [
  {
    id: 'ke1',
    name: 'Daily Adventure',
    price: 55,
    category: 'kids-everyday',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
    description: 'Versatile sneakers for everyday activities'
  },
  {
    id: 'ke2',
    name: 'Comfort Play',
    price: 60,
    category: 'kids-everyday',
    image: 'https://images.unsplash.com/photo-1507464098880-e367bc5d2c08',
    description: 'Easy-wear sneakers with flexible soles'
  },
  {
    id: 'ke3',
    name: 'Casual Fun',
    price: 50,
    category: 'kids-everyday',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2',
    description: 'Lightweight casual shoes for daily wear'
  },
  {
    id: 'ke4',
    name: 'Play All Day',
    price: 58,
    category: 'kids-everyday',
    image: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea',
    description: 'Durable everyday shoes with easy fastening'
  }
];

export default function KidsEverydaySneakers() {
  return (
    <ProductGrid
      products={products}
      title="Kids' Everyday Sneakers"
      description="Comfortable and durable sneakers perfect for daily activities. Easy to put on and built to last."
    />
  );
}