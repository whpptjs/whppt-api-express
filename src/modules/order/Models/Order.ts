import { Address } from 'src/modules/contact/Models/Contact';
import { Product } from 'src/modules/product/Models/Product';

export type Order = {
  _id: string;
  orderNumber?: string;
  domainId?: string;
  contact?: OrderContact;
  memberId?: string;
  items: OrderItem[];
  billing?: Billing;
  shipping?: Shipping;
  discountIds?: string;
  checkoutStatus: 'pending' | 'paid' | 'refunded';
  dispatchedStatus?: 'pending' | 'packed' | 'dispatched';
  createdAt?: Date;
  payment?: Payment;
  updatedAt?: Date;
  note?: string;
  fromPos?: boolean;
  number?: string | number;
  stripe?: {
    intentId: string;
    status: 'pending' | 'paid';
    amount: number;
  };
  staffId?: string;
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
  status: 'preparing' | 'dispatched' | 'delivered';
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
  type?: 'card' | 'cash';
  date: Date;
  amount: number;
  subTotal: number;
  memberTotalDiscount: number;
  memberShippingDiscount: number;
};

export type AusPostShipping = {
  shipmentId: string;
  label_request_id: string;
  status: 'labelPrinted';
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
