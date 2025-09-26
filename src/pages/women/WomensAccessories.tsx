import ProductGrid from '../../components/ProductGrid';

const products = [
  {
    id: '1',
    name: 'Classic Watch',
    price: 195,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
    description: 'Minimalist design timepiece'
  },
  {
    id: '2',
    name: 'Leather Tote',
    price: 245,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7',
    description: 'Sustainable leather bag'
  },
  {
    id: '3',
    name: 'Chain Bracelet',
    price: 85,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0',
    description: 'Delicate gold-plated bracelet'
  },
  {
    id: '4',
    name: 'Crossbody Bag',
    price: 175,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c',
    description: 'Versatile everyday bag'
  }
];

export default function WomensAccessories() {
  return (
    <ProductGrid
      products={products}
      title="Women's Accessories"
      description="Complete your look with our curated collection of sustainable accessories. From timeless watches to elegant bags."
    />
  );
}