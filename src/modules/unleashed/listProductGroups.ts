import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const listProductGroups: HttpModule<{}, { _id: string; amount: number }[]> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('unleashed')
        .aggregate<{ _id: string; amount: number }>([
          {
            $group: {
              _id: '$ProductGroup.GroupName',
              amount: {
                $sum: 1,
              },
            },
          },
        ])
        .toArray();
    });
  },
};
export default listProductGroups;
