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
  department?: StaffDepartment;
  isActive?: boolean;
};

export type StaffContact = Staff & { contact: Contact };
export type StaffDepartment = 'Cellar Door' | 'Office' | 'Restaurant';
