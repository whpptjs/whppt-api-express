import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { StaffContact } from './Model';
import { Secure } from './Secure';

const authMember: HttpModule<void, StaffContact> = {
  authorise(context) {
    if (context.staff) return Promise.resolve(true);

    return Promise.reject({ status: 401, message: 'Not Authrozided' });
  },
  exec({ $database, staff }) {
    return $database.then(database => {
      assert(staff.sub, 'Staff Id required');

      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('staff')
        .aggregate<StaffContact>([
          {
            $match: {
              _id: staff.sub._id,
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
        .then(staffMembers => {
          assert(staffMembers.length, 'Staff Member not found.');
          return staffMembers[0];
        });
    });
  },
};

export default Secure(authMember);
