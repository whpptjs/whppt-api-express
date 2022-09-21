export type WhpptUser = {
  _id: string;
  username: string;
  roles: string[];
  isGuest: boolean;
};

export const WhpptUser = (values: any) => {
  return {
    _id: values._id,
    username: values.username,
    roles: values.roles || [],
    isGuest: values._id === 'guest',
  } as WhpptUser;
};
