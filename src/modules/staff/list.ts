import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Staff, StaffContact } from './Model';

const list: HttpModule<
  {
    limit: string;
    currentPage: string;
    search: string;
  },
  { staff: Staff[]; total: number }
> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { limit, currentPage, search }) {
    let query = {} as any;

    if (search) query.name = { $regex: search, $options: 'i' };

    return $database.then(database => {
      const { db, countDocuments } = database as WhpptMongoDatabase;

      const _limit = parseInt(limit);
      const _currentPage = parseInt(currentPage) - 1;

      return Promise.all([
        db
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
          .skip(_limit * _currentPage)
          .limit(_limit)
          .toArray(),
        countDocuments('staff', { filter: query }),
      ]).then(([staff, total]) => {
        return { staff, total };
      });
    });
  },
};
export default list;
