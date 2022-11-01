import { ContactDetails } from 'src/modules/order/Models/Order';

export type Contact = {
  _id: string;
  memberId?: string;
  email: string;
  firstName?: string;
  company?: string;
  phone?: string;
  lastName?: string;
  phoneNumber?: number;
  address?: Address;
  shipping: ContactBillingAndShipping;
  billing: ContactBillingAndShipping;
};

export type Address = {
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  country: string;
  state: string;
};

export type ContactBillingAndShipping = {
  address: Address;
  contactDetails: ContactDetails;
};
