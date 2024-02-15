import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';
import { Secure } from '../staff/Secure';

const setArchives: HttpModule<{ memberId: string, isArchived: boolean }, Member> = {
  exec({ $database, createEvent }, { memberId, isArchived }) {
    assert(memberId, 'A memberId is required');

    return $database.then(database => {
      const { document, startTransaction } = database;

      return document.fetch<Member>('members', memberId).then(loadedMember => {
        assert(loadedMember, 'Could not find member.');
        
        const newArchiveState = isArchived
        const memberEvents = [createEvent('ArchiveMember', {memberId, newArchiveState})];
        loadedMember.isArchived = isArchived;

        return startTransaction(session => {
          return document.saveWithEvents('members', loadedMember, memberEvents, {
            session,
          });
        }).then(()=>loadedMember)
      })
      
    });
  },
};

//TODO add staff secure
export default Secure(setArchives);
