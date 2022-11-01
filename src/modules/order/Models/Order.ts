import { Address } from 'src/modules/contact/Models/Contact';
import { Product } from '../../product/Models/Product';

export type Order = {
  _id: string;
  domainId?: string;
  contact?: OrderContact;
  items: OrderItem[];
  billing?: Billing;
  shipping?: Shipping;
  discountIds?: string;
  checkoutStatus: 'pending' | 'paid';
  dispatchedStatus?: 'pending' | 'picked' | 'packed' | 'dispatched';
  createdAt?: Date;
  payment?: Payment;
  updatedAt?: Date;
  stripe: {
    intentId: string;
    status: 'pending' | 'paid';
    amount: number;
  };
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

export type OrderContact = {
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
};
export type Member = {
  _id: string;
  loyaltyLevel: string;
  contactId: string;
  amountSpent: number;
};
