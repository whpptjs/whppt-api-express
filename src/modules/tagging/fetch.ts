import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

export type FetchConstructor = (
  developerTags: any
) => HttpModule<{ domainId: string }, {}>;

const fetch: FetchConstructor = developerTags => ({
  exec({ $database }, { domainId }) {
    return $database.then(database => {
      const { db } = database as WhpptMongoDatabase;
      return db
        .collection('site')
        .findOne({ _id: `tags_${domainId}` })
        .then(settings => {
          if (!settings) return combineTags(developerTags, []);
          return combineTags(developerTags, settings.tags);
        });
    });
  },
});

export default fetch;

const combineTags = (developerTags: any, customTags: any) => {
  return [...developerTags.map((t: any) => ({ ...t, isDev: true })), ...customTags];
};
