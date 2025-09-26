import ProductGrid from '../../components/ProductGrid';

const products = [
  {
    id: '1',
    name: 'Athletic Pro',
    price: 18,
    category: 'socks',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82',
    description: 'High-performance athletic socks'
  },
  {
    id: '2',
    name: 'Runner Elite',
    price: 22,
    category: 'socks',
    image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558',
    description: 'Marathon-ready comfort'
  },
  {
    id: '3',
    name: 'Training Pack',
    price: 45,
    category: 'socks',
    image: 'https://images.unsplash.com/photo-1589902860314-e910697dea18',
    description: '3-pack training socks'
  },
  {
    id: '4',
    name: 'Compression Pro',
    price: 28,
    category: 'socks',
    image: 'https://images.unsplash.com/photo-1583242317776-528445937fbe',
    description: 'Recovery compression socks'
  }
];

export default function PerformanceSocks() {
  return (
    <ProductGrid
      products={products}
      title="Performance Socks"
      description="Technical socks designed for superior performance. Features moisture-wicking materials, strategic cushioning, and arch support for maximum comfort during activities."
    />
  );
}