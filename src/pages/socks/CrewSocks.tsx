import ProductGrid from '../../components/ProductGrid';

const products = [
  {
    id: '1',
    name: 'Classic Crew',
    price: 15,
    category: 'crew',
    image: 'https://images.unsplash.com/photo-1589902860314-e910697dea18',
    description: 'Everyday crew socks'
  },
  {
    id: '2',
    name: 'Merino Crew',
    price: 22,
    category: 'crew',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82',
    description: 'Wool blend crew socks'
  },
  {
    id: '3',
    name: 'Sport Crew',
    price: 18,
    category: 'crew',
    image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558',
    description: 'Athletic crew socks'
  },
  {
    id: '4',
    name: 'Comfort Pack',
    price: 45,
    category: 'crew',
    image: 'https://images.unsplash.com/photo-1583242317776-528445937fbe',
    description: '3-pack crew socks'
  }
];

export default function CrewSocks() {
  return (
    <ProductGrid
      products={products}
      title="Crew Socks"
      description="Classic crew length socks for everyday comfort. Made with sustainable materials and available in various styles for all occasions."
    />
  );
}