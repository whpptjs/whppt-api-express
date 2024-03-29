import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member, Note } from './Model';
import { Secure } from '../staff/Secure';

const saveNote: HttpModule<{ memberId: string; note: string }, Note> = {
  exec({ $database, $id, createEvent, staff }, { memberId, note }) {
    assert(memberId, 'A contact Id is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document.fetch<Member>('members', memberId).then(loadedMember => {
        assert(loadedMember, 'Could not find member.');

        const memberNote = {
          _id: $id.newId(),
          note,
          date: new Date(),
          //TODO add staff SECURE
          author: {
            _id: staff?.sub?._id,
            name: staff?.sub?.username,
          },
        };

        const memberEvents = [createEvent('AddedNoteToMember', { memberId, memberNote })];
        loadedMember.notes = loadedMember.notes
          ? [...loadedMember.notes, memberNote]
          : [memberNote];

        return startTransaction(session => {
          return document.saveWithEvents('members', loadedMember, memberEvents, {
            session,
          });
        }).then(() => memberNote);
      });
    });
  },
};

export default Secure(saveNote);
