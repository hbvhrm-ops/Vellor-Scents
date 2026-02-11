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

export interface CartItem extends Perfume {
  quantity: number;
}

export interface Order {
  id: string;
  customerName?: string;
  customerEmail?: string;
  whatsappNumber?: string;
  address?: string;
  postalCode?: string;
  items: CartItem[];
  totalAmount: number;
  status: string;
  transactionScreenshot?: string;
  createdAt?: unknown;
  date?: string;
}
