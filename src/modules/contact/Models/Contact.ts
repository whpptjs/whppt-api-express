import { ContactDetails } from 'src/modules/order/Models/Order';

export type Contact = {
  _id: string;
  email?: string;
  firstName?: string;
  company?: string;
  phone?: string;
  lastName?: string;
  stripeCustomerId?: string;
  mobile?: string;
  isSubscribed?: boolean;
  address?: Address;
  shipping: ContactShipping;
  billing: ContactBilling;
};

export type Address = {
  unit?: string;
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
