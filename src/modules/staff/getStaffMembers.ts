import { HttpModule } from '../HttpModule';
import type { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';

import { Secure } from './Secure';
import { StaffContact } from './Model';

const getStaffMembers: HttpModule<{ username: string }, StaffContact[]> = {
  exec({ $database }, { username }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;

      const query = username
        ? {
            username,
          }
        : {};

      return db
        .collection('staff')
        .aggregate<StaffContact>([
          {
            $match: query,
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
        .toArray();
    });
  },
};

export default Secure(getStaffMembers);
