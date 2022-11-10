import assert from 'assert';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Member, MemberContact } from './Model';
import { Secure } from './Secure';

const memberInfo: HttpModule<{ memberId: string }, Member> = {
  authorise(context) {
    if (context.member) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec({ $database }, { memberId }) {
    return $database.then(database => {
      assert(memberId, 'Member Id required');

      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('members')
        .aggregate<MemberContact>([
          {
            $match: {
              _id: memberId,
            },
          },
          {
            $lookup: {
              from: 'contacts',
              localField: 'contactId',
              foreignField: '_id',
              as: 'contact',
            },
          },
          {
            $unwind: {
              path: '$contact',
            },
          },
          {
            $project: {
              password: 0,
            },
          },
        ])
        .toArray()
        .then(members => {
          assert(members.length, 'Member not found.');
          return members[0];
        });
    });
  },
};

export default Secure(memberInfo);
