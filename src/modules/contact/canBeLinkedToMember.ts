import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

const canBeLinkedToMember: HttpModule<{ email: string }, Contact | undefined> = {
  exec({ $database }, { email }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document } = database;

      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          assert(!usedEmail || !usedEmail.memberId, 'Email already in use.');
          return usedEmail || undefined;
        });
    });
  },
};

export default canBeLinkedToMember;
