import { Contact } from 'src/modules/contact/Models/Contact';

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
  author: { _id: string; name: string } | string;
  date: Date;
};
export type MemberContact = Member & { contact: Contact };
