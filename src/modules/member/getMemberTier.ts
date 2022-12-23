import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import assert from 'assert';
import { HttpModule } from '../HttpModule';
// import { Member, MemberContact } from './Model';
// import { Secure } from './Secure';
import { Order } from '../order/Models/Order';
import { MembershipOptions } from '../membershipTier/Models/MembershipTier';

const getMemberTier: HttpModule<{ memberId: string; domainId: string }, any> = {
  // authorise(context) {
  //   // if (context.member) return Promise.resolve(true);

  //   return Promise.reject({ status: 401, message: 'Not Authrozided' });
  // },
  exec({ $database, member }, { domainId, memberId }) {
    console.log('🚀 ~ file: getMemberTier.ts:16 ~ exec ~ member', member);
    return $database.then(database => {
      // assert(member.sub, 'Member Id required');
      const year = new Date().getFullYear();
      console.log('🚀 ~ file: getMemberLevel.ts:19 ~ exec ~ year', year);

      const startYear = new Date(`1/1/${year} 10:30`);
      const endYear = new Date(`1/1/${year + 1} 10:30`);

      const { db, document } = database as WhpptMongoDatabase;
      return Promise.all([
        db
          .collection('orders')
          .aggregate<Order>([
            {
              $match: {
                memberId: memberId,
                $and: [
                  {
                    updatedAt: {
                      $gte: startYear,
                    },
                  },
                  {
                    updatedAt: { $lt: endYear },
                  },
                ],
                // memberId: member.sub._id,
                'stripe.status': 'paid',
              },
            },
            {
              $project: {
                stripe: 0,
              },
            },
          ])
          .toArray(),
        document.query<MembershipOptions>('site', {
          filter: { _id: `membershipOptions_${domainId}` },
        }),
      ]).then(([orders, membershipTiers]) => {
        console.log('🚀 ~ file: getMemberTier.ts:50 ~ ]).then ~ orders', orders);
        // assert(members.length, 'Member not found.');
        assert(membershipTiers, 'MembershipTiers not found.');

        const amountSpentForYear = '';

        return amountSpentForYear;
      });
    });
  },
};

export default getMemberTier;
// export default Secure(getMemberTier);
