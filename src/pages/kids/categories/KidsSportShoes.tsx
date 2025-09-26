import ProductGrid from '../../../components/ProductGrid';

const products = [
  {
    id: 'ks1',
    name: 'Speed Runner',
    price: 75,
    category: 'kids-sport',
    image: 'https://images.unsplash.com/photo-1507464098880-e367bc5d2c08',
    description: 'Lightweight running shoes for young athletes'
  },
  {
    id: 'ks2',
    name: 'Court Champion',
    price: 70,
    category: 'kids-sport',
    image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782',
    description: 'Tennis and court sports shoes with extra grip'
  },
  {
    id: 'ks3',
    name: 'Field Star',
    price: 80,
    category: 'kids-sport',
    image: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea',
    description: 'Multi-purpose sports shoes for field activities'
  },
  {
    id: 'ks4',
    name: 'Training Pro',
    price: 72,
    category: 'kids-sport',
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2',
    description: 'Supportive shoes for various sports training'
  }
];

export default function KidsSportShoes() {
  return (
    <ProductGrid
      products={products}
      title="Kids' Sport Shoes"
      description="Performance sports shoes designed for young athletes. Featuring enhanced support and durability for various sporting activities."
    />
  );
}