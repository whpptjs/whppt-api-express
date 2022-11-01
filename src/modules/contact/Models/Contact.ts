export type Contact = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: number;
  address?: Address;
  billingAddress?: Address;
  shippingAddress?: Address;
};

export type Address = {
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  country: string;
  state: string;
};
