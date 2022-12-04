import { HttpModule } from '../HttpModule';
import { Tag } from './models';

export type SaveArgs = { domainId: string; tags: Tag[] };

const save: HttpModule<SaveArgs, {}> = {
  exec({ $database }, { domainId, tags }) {
    const tagSettings = { _id: `tags_${domainId}`, tags };

    return $database.then(db => {
      return db.startTransaction(session => {
        return db.document
          .save('site', tagSettings, { session })
          .then(() => db.document.publish('site', tagSettings, { session }));
      });
    });
  },
};

export default save;
