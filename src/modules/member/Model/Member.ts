export type Member = {
  _id: string;
  contactId: string;
  username: string;
  password?: string;
  membership?: string;
  email?: string;
  createdAt?: Date;
};
