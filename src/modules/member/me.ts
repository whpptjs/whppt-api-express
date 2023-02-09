import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { Member, MemberContact } from './Model';
import { Secure } from './Secure';
import { queryMemberTier } from '../order/Queries/queryMemberTier';

const authMember: HttpModule<{ domainId: string }, Member> = {
  authorise(context) {
    if (context.member) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec(context, { domainId }) {
    const { $database, member } = context;
    return $database.then(database => {
      assert(member.sub, 'Member Id required');

      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('members')
        .aggregate<MemberContact>([
          {
            $match: {
              _id: member.sub._id,
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
              notes: 0,
            },
          },
        ])
        .toArray()
        .then(members => {
          assert(members.length, 'Member not found.');
          const member = members[0];
          assert(member && member._id, 'Member not found.');
          if (!domainId) return { ...member, memberTier: {} };
          return queryMemberTier(context, { memberId: member._id, domainId }).then(
            memberTier => {
              return { ...member, memberTier };
            }
          );
        });
    });
  },
};

export default Secure(authMember);
