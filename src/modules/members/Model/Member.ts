import { Address } from '../../../modules/order/Models/Order';

export type Member = {
  _id: string;
  username: string;
  password: string;
  membership: string;
  totalPaid: string;
  createdAt?: Date;
};

export type Contact = {
  _id: string;
  firstName: string;
  email: string;
  lastName: string;
  phone: string;
  address: Address;
  // shipping: Shipping;
  // billing: Shipping;
  createdAt?: Date;
};
