export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: Category;
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  weight: string;
  ingredients: string[];
  shelfLife: string;
  maxOrderLimit?: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

export type Category =
  | 'All'
  | 'Pickles'
  | 'Jams & Preserves'
  | 'Spices'
  | 'Honey'
  | 'Snacks'
  | 'Beverages'
  | 'Ready Mixes';

export type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'rating';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export type PaymentMethod = 'upi' | 'bank_transfer' | 'cod';

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  transactionId: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
