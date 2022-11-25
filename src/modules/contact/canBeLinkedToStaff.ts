import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Staff } from '../staff/Model';
import { Contact } from './Models/Contact';

const canBeLinkedToStaff: HttpModule<{ email: string }, Contact | boolean> = {
  exec({ $database }, { email }) {
    assert(email, 'A email is required');

    return $database.then(database => {
      const { document } = database;

      return document
        .query<Contact>('contacts', { filter: { email } })
        .then(usedEmail => {
          if (!usedEmail) return true;
          return document
            .query<Staff>('staff', {
              filter: { contactId: usedEmail._id },
            })
            .then(staff => {
              if (staff) return false;
              return usedEmail;
            });
        });
    });
  },
};

export default canBeLinkedToStaff;
