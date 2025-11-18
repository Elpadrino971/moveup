/**
 * MoovUp Now - Shop Types
 */

export type ProductCategory =
  | 'clothing'
  | 'accessories'
  | 'nutrition'
  | 'equipment'
  | 'digital';

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // in cents
  pointsPrice?: number; // Can be bought with points
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  isBranded: boolean; // MoovUp Now branded product
  hasQRCode?: boolean; // For clothing with integrated QR
  isPopular: boolean;
  isFeatured: boolean;
  createdAt: string;
};

export type CartItem = {
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number; // in cents
  pointsUsed?: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type Address = {
  id?: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal' | 'apple-pay' | 'google-pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
};
