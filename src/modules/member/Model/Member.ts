import { Contact } from 'src/modules/contact/Models/Contact';
import { Staff } from 'src/modules/staff/Model';

export type Member = {
  _id: string;
  contactId: string;
  username: string;
  password?: string;
  lockToTier?: string;
  createdAt?: Date;
  notes?: Note[];
};

export type Note = {
  _id: string;
  note: string;
  by: Staff | Member | string;
  date: Date;
};
export type MemberContact = Member & { contact: Contact };
