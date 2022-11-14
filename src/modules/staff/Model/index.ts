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
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};
