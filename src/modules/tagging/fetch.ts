import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const fetch: HttpModule<{ domainId: string }, any> = {
  exec({ $database }, { domainId }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('site')
        .findOne({ _id: `tags_${domainId}` })
        .then(setting => {
          return setting?.tags || [];
        });
    });
  },
};

export default fetch;
