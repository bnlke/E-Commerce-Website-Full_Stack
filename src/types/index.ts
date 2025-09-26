export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category?: string;
  tags?: string[];
  sizeAvailability?: {
    size: string;
    inStock: boolean;
  }[];
}

export interface SizeChart {
  title: string;
  description?: string;
  headers: string[];
  rows: (string | number)[][];
}