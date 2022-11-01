import { Contact } from 'src/modules/contact/Models/Contact';

export type Member = {
  _id: string;
  contactId: string;
  username: string;
  password?: string;
  createdAt?: Date;
};

export type MemberContact = Member & { contact: Contact };
