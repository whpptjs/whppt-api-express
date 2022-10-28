import { Product } from '../../product/Models/Product';

export type Order = {
  _id: string;
  domainId?: string;
  contactRecord?: {
    email: string;
  };
  items: OrderItem[];
  billingAddress?: Address;
  shipping?: Shipping;
  contactId?: string;
  discountIds?: string;
  paymentIntent?: string;
  ausPostShipping?: AusPostShipping;
  orderStatus: 'pending' | 'completed';
  createdAt?: Date;
  payment?: Payment;
  updatedAt?: Date;
};

export type Shipping = {
  address: Address;
  shippingCost: number;
  firstName: string;
  lastName: string;
  company: string;
};

export type OrderItem = {
  _id: string;
  productId?: string;
  quantity: number;
  product?: Product;
};

export type Payment = {
  _id: string;
};
export type AusPostShipping = {
  _id: string;
};
export type Address = {
  _id: string;
};

export type Contact = {
  _id: string;
  firstName: string;
  lastName: string;
  address: Address;
};
export type Member = {
  _id: string;
  loyaltyLevel: string;
  contactId: string;
  amountSpent: number;
};
