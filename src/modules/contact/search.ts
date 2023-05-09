import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Secure } from '../staff/Secure';
import { Contact } from './Models/Contact';

const search: HttpModule<{ searchBy: string }, Contact[]> = {
  exec({ $database }, { searchBy }) {
    if (!searchBy) return Promise.resolve([] as Contact[]);

    const query = [
      {
        $or: [
          { firstName: { $regex: searchBy, $options: 'i' } },
          { lastName: { $regex: searchBy, $options: 'i' } },
          {
            $and: [
              { firstName: { $regex: searchBy.split(' ')[0], $options: 'i' } },
              { lastName: { $regex: searchBy.split(' ')[1] || '', $options: 'i' } },
            ],
          },
          { email: { $regex: searchBy, $options: 'i' } },
          { _id: searchBy },
        ],
      },
    ];

    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('contacts')
        .aggregate<Contact>([
          {
            $match: {
              $or: query,
            },
          },
          {
            $limit: 50,
          },
        ])
        .toArray();
    });
  },
};

export default Secure(search);
