import { Contact } from 'src/modules/contact/Models/Contact';

export type StaffLoginArgs = {
  username: string;
  password: string;
};

export const emptyStaffLoginArgs = {
  username: '',
  password: '',
};

export type Staff = {
  _id: string;
  contactId: string;
  username: string;
  password?: string;
  createdAt?: Date;
};

export type StaffContact = Staff & { contact: Contact };
