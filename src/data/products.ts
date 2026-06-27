import type { Product } from '../types';

// No pre-installed products — all managed from admin panel via Firebase
export const products: Product[] = [];

export const categories = [
  'All',
] as const;
