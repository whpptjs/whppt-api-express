import { ContactDetails } from 'src/modules/order/Models/Order';

export type Contact = {
  _id: string;
  email?: string;
  firstName?: string;
  company?: string;
  phone?: string;
  lastName?: string;
  stripeCustomerId?: string;
  phoneNumber?: number;
  isSubscribed?: boolean;
  address?: Address;
  shipping: ContactShipping;
  billing: ContactBilling;
};

export type Address = {
  number: string;
  street: string;
  suburb: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
};

export type ContactShipping = {
  address: Address;
  contactDetails: ContactDetails;
};
export type ContactBilling = {
  address: Address;
  contactDetails: ContactDetails;
};
