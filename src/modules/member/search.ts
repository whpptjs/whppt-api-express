import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';
import { Member } from './Model';

const search: HttpModule<{ searchBy: string }, Member[]> = {
  //   authorise() {
  //     //TODO make this staff member only
  //     return Promise.resolve(true);
  //   },
  exec({ $database }, { searchBy }) {
    if (!searchBy) return Promise.resolve([] as Member[]);
    const query = [
      { firstName: { $regex: searchBy, $options: 'i' } },
      { lastName: { $regex: searchBy, $options: 'i' } },
      { email: { $regex: searchBy, $options: 'i' } },
    ];

    //TODO make this a mongo search query
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('contacts')
        .aggregate<Member>([
          {
            $match: {
              $or: query,
            },
          },
          {
            $lookup: {
              from: 'members',
              localField: '_id',
              foreignField: 'contactId',
              as: 'member',
            },
          },
          {
            $unwind: {
              path: '$member',
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                _id: '$member._id',
                contactId: '$member.contactId',
                username: '$member.username',
                contact: {
                  _id: '$_id',
                  firstName: '$firstName',
                  lastName: '$lastName',
                  email: '$email',
                  phone: '$phone',
                  company: '$company',
                  billing: '$billing',
                  shipping: '$shipping',
                },
              },
            },
          },
        ])
        .toArray();
    });
  },
};

export default search;