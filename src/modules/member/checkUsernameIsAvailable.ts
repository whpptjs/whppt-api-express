import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const checkUsernameIsAvailable: HttpModule<{ username: string }, void> = {
  exec({ $database }, { username }) {
    assert(username, 'A username is required');

    return $database.then(database => {
      const { document } = database;

      return document
        .query<Member>('members', { filter: { username } })
        .then(usedUsername => {
          assert(!usedUsername, 'Username already in use.');
          return;
        });
    });
  },
};

export default checkUsernameIsAvailable;
