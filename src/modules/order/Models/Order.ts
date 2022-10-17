import { Product } from '../../product/Models/Product';

export type Order = {
  _id: string;
  domainId?: string;
  items: OrderItem[];
  billingAddress?: Address;
  shippingAddress?: Address;
  contactId?: string;
  discountIds?: string;
  shipping?: AusPostShipping;
  orderStatus: 'pending' | 'pending';
  payment?: Payment;
  createdAt?: Date;
  updatedAt?: Date;
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
