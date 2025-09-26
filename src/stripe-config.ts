// Stripe product configuration
export const stripeProducts = [
  {
    name: 'Woman Leggings',
    priceId: 'price_1RH52oFaEHaNHSED0zoGdghm',
    description: 'Black',
    mode: 'payment'
  },
  {
    name: 'Air Max 12',
    priceId: 'price_1RH525FaEHaNHSEDt2eWHbwk',
    description: 'White Color',
    mode: 'payment'
  },
  {
    name: 'Nike Air Force 1',
    priceId: 'price_1RH2xJFaEHaNHSEDF9MtttVu',
    description: 'White Color',
    mode: 'payment'
  }
];

// Function to get product by price ID
export const getProductByPriceId = (priceId: string) => {
  return stripeProducts.find(product => product.priceId === priceId);
};