import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Contact } from './Models/Contact';

const checkEmailAvailability: HttpModule<{ email: string; contactId?: string }, boolean> =
  {
    exec({ $database }, { email, contactId }) {
      assert(email, 'A email is required');

      return $database.then(database => {
        const { document } = database;

        const query = { filter: { email } } as any;
        if (contactId) query.filter._id = { $ne: contactId };

        return document.query<Contact>('contacts', query).then(usedEmail => {
          return !usedEmail;
        });
      });
    },
  };

export default checkEmailAvailability;
