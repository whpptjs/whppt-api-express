import assert from 'assert';
import { WhpptDatabase } from 'src/Services';
import { WhpptUser } from 'src/Services/Security/User';

export type Identity = {
  isUser: (user: WhpptUser) => Promise<void> | void;
};

export type IdentityConstructor = (database: WhpptDatabase) => Identity;

export const Identity: IdentityConstructor = () => {
  return {
    isUser: user => assert(user._id !== 'guest', 'Unauthorised'),
  };
};
