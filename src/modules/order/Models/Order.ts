import { Address } from 'src/modules/contact/Models/Contact';
import { Product } from 'src/modules/product/Models/Product';

export type Order = {
  _id: string;
  domainId?: string;
  contact?: OrderContact;
  memberId?: string;
  items: OrderItem[];
  billing?: Billing;
  shipping?: Shipping;
  discountIds?: string;
  checkoutStatus: 'pending' | 'paid';
  dispatchedStatus?: 'pending' | 'picked' | 'packed' | 'dispatched';
  createdAt?: Date;
  payment?: Payment;
  updatedAt?: Date;
  note?: string;
  stripe?: {
    intentId: string;
    status: 'pending' | 'paid';
    amount: number;
  };
};

export type ShippingCost = {
  price: number | string | undefined;
  allowCheckout: boolean;
  message?: string;
  type: 'aus_metro' | 'aus_regional' | 'international' | 'pickup';
};

export type Shipping = {
  address: Address;
  contactDetails: ContactDetails;
  shippingCost: ShippingCost;
  ausPost?: AusPostShipping;
  status: 'preparing' | 'inTransit' | 'delivered';
  pickup?: boolean;
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
  purchasedPrice?: number;
};

export type OrderWithProducts = Order & {
  items?: OrderItemWithProduct[];
};

export type OrderItemWithProduct = OrderItem & {
  product?: Product;
  _id: string;
  productId?: string;
  quantity: number;
};

export type Payment = {
  status: 'pending' | 'refunded' | 'paid';
  date: Date;
  amount: number;
  tax: number;
  subTotal: number;
  memberTotalDiscount: number;
  memberShippingDiscount: number;
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
