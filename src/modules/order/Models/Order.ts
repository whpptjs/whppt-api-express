import { Address } from 'src/modules/contact/Models/Contact';
import { Product } from '../../product/Models/Product';

export type Order = {
  _id: string;
  domainId?: string;
  contactRecord?: {
    email: string;
  };
  items: OrderItem[];
  billing?: Billing;
  shipping?: Shipping;
  contactId?: string;
  discountIds?: string;
  checkoutStatus: 'pending' | 'completed';
  dispatchedStatus: 'pending' | 'picked' | 'packed' | 'dispatched';
  createdAt?: Date;
  payment?: Payment;
  updatedAt?: Date;
};

export type Shipping = {
  address: Address;
  contactDetails: ContactDetails;
  shippingCost: number;
  ausPost?: AusPostShipping;
  status: 'preparing' | 'inTransit' | 'delivered';
};
export type Billing = {
  address: Address;
  contactDetails: ContactDetails;
};

export type ContactDetails = {
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
