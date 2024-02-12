import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';
import { Secure } from '../staff/Secure';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

const editNote: HttpModule<{ memberId: string; noteId: string, note: string }, Member> = {
  exec({ $database }, { memberId, noteId, note }) {
    assert(memberId, 'A contact Id is required');

    return $database.then(database => {
      const { document, startTransaction } = database as WhpptMongoDatabase;

      return document.fetch<Member>('members', memberId).then(loadedMember => {
        assert(loadedMember, 'Could not find member.');

        // const recordId = loadedMember._id; // Assuming _id is a property of the Member interface
        const noteIndex = loadedMember.notes?.findIndex(note => note._id === noteId);

        if (noteIndex !== undefined && noteIndex !== -1) {
          // Update the note content
          if (loadedMember.notes) {
            loadedMember.notes[noteIndex].note = note;
          }

          return startTransaction(session => {
            return document.save('members', loadedMember, { session }).then(() => {
              console.log(`Note with _id ${noteId} edited successfully.`);
              return loadedMember;
            });
          });
        } else {
          console.log(`Note with _id ${noteId} not found.`);
          return loadedMember;
        }
      });
    });
  },
};

export default Secure(editNote);
