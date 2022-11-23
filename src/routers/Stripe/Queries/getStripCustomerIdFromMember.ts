import assert from 'assert';
import { Db } from 'mongodb';
import { ContextType } from 'src/context/Context';
import { MemberContact } from 'src/modules/member/Model';
import { Order } from 'src/modules/order/Models/Order';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

export type GetStripCustomerIdFromMemberArgs = (
  context: ContextType,
  stripe: any,
  memberId: string | undefined
) => Promise<Order>;

export const getStripCustomerIdFromMember: GetStripCustomerIdFromMemberArgs = (
  { $database },
  stripe,
  memberId
) => {
  console.log('🚀memberId', memberId);
  if (!memberId) return Promise.resolve();
  return $database.then(database => {
    const { db, document } = database as WhpptMongoDatabase;

    return getMemberContact(db, memberId).then(({ contact }) => {
      assert(contact, 'Member Contact Not Found.');
      if (contact.stripeCustomerId) return contact.stripeCustomerId;
      const name = `${contact.firstName} ${contact.lastName}`;

      return stripe.customers.create({ name }).then((customer: any) => {
        console.log('🚀 customer', customer);
        contact.stripeCustomerId = customer.id;
        return document.save('contacts', contact).then(() => {
          return contact.stripeCustomerId;
        });
      });
    });
  });
};

const getMemberContact = (db: Db, memberId: string) => {
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
          _id: 1,
          contact: 1,
          stripeCustomerId: 1,
        },
      },
    ])
    .toArray()
    .then(members => {
      return members[0] || {};
    });
};
