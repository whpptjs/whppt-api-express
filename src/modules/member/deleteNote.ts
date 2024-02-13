import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';
import { Secure } from '../staff/Secure';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

const deleteNote: HttpModule<{ memberId: string; noteId: string }, Member> = {
  exec({ $database }, { memberId, noteId }) {
    assert(memberId, 'A contact Id is required');

    return $database.then(database => {
      const { document, db /*, startTransaction*/ } = database as WhpptMongoDatabase;

      return document.fetch<Member>('members', memberId).then(loadedMember => {
        assert(loadedMember, 'Could not find member.');

        const recordId = loadedMember._id; // Assuming _id is a property of the Member interface
        const noteToRemoveId = noteId; // Replace with the actual _id of the note to remove
        return db
          .collection('members')
          .updateOne({ _id: recordId }, { $pull: { notes: { _id: noteToRemoveId } } })
          .then(result => {
            if (result.modifiedCount === 1) {
              console.log(`Note with _id ${noteToRemoveId} removed successfully.`);
            } else {
              console.log(`Note with _id ${noteToRemoveId} not found.`);
            }

            return loadedMember;
          });
      });
    });
  },
};

export default Secure(deleteNote);
