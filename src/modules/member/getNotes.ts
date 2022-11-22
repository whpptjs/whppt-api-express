import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member, Note } from './Model';

const listPreviousOrders: HttpModule<{ memberId: string }, Note[] | undefined> = {
  exec({ $database }, { memberId }) {
    assert(memberId, 'A memberId is required');

    return $database.then(({ queryDocuments }) => {
      return queryDocuments<Member>('members', {
        filter: { _id: memberId },
        limit: 1,
        projection: { notes: 1 },
      }).then(members => {
        const member = members && members[0];
        if (!member) return Promise.reject({ status: 404, message: 'Member Not Found.' });
        return member.notes || [];
      });
    });
  },
};

//TODO add staff secure
export default listPreviousOrders;
