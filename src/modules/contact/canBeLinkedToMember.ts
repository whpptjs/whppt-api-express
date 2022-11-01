import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from '../member/Model';
import { Contact } from './Models/Contact';

const canBeLinkedToMember: HttpModule<{ email: string }, Contact | boolean> = {
  exec({ $database }, { email }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document } = database;

      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          if (!usedEmail) return true;
          return document
            .query<Member>('members', {
              filter: { contactId: usedEmail._id },
            })
            .then(member => {
              if (member) return false;
              return usedEmail;
            });
        });
    });
  },
};

export default canBeLinkedToMember;
