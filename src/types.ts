export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  weight: string;
  stockQty: number;
  inStock: boolean;
  featured: boolean;
  spiceLevel: number;
  ingredients: string[];
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email: string;
  addresses: Address[];
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'uploaded' | 'verified' | 'failed';
export type ReplacementStatus = 'requested' | 'accepted' | 'shipping' | 'completed' | 'rejected';
export type RefundStatus = 'pending' | 'processed' | 'completed';

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  address: Address;
  subtotal: number;
  deliveryFee: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  replacementStatus?: ReplacementStatus;
  refundStatus?: RefundStatus;
  refundTxnId?: string;
  upiTransactionId?: string;
  notes?: string;
  statusHistory?: Record<string, string>; // { pending: "2025-01-01T...", confirmed: "2025-01-02T..." }
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  upiId: string;
  upiName: string;
  minFreeDelivery: number;
  deliveryFee: number;
  socialLinks: {
    instagram: string;
    facebook: string;
    whatsapp: string;
  };
  announcement: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;           // percentage (0-100) or flat ₹ amount
  minOrder: number;        // minimum cart subtotal required
  maxDiscount?: number;    // cap for percent coupons
  maxUses: number;         // total uses allowed (0 = unlimited)
  usedCount: number;       // how many times used
  perUser: number;         // uses per customer (0 = unlimited)
  validFrom: string;
  validUntil: string;
  active: boolean;
  description: string;
  createdAt: string;
}

export const PRESET_TAGS = [
  'bestseller', 'new', 'limited-edition', 'limited-stock', 'most-popular',
  'high-rated', 'vegan', 'gluten-free', 'vegetarian', 'spicy', 'mild', 'sugar-free'
];
