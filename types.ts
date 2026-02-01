
// Core type definitions for the luxury fragrance application
export interface Perfume {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

export type OrderStatus = 'pending' | 'verified' | 'rejected';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  whatsappNumber: string;
  address: string;
  postalCode: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  transactionScreenshot: string;
  date: string;
}
