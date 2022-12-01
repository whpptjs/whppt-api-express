import { HttpModule } from '../HttpModule';
import { Tag } from './models';

export type SaveArgs = { domainId: string; tags: Tag[] };
export type SaveConstructor = (developerTags: any) => HttpModule<SaveArgs, {}>;

const save: SaveConstructor = developerTags => ({
  exec({ $database }, { domainId, tags }) {
    const developerTagIds = developerTags.map((t: any) => t.id);
    const customTags = tags.filter(t => !developerTagIds.includes(t.id));
    const tagSettings = { _id: `tags_${domainId}`, tags: customTags };

    return $database.then(db => {
      return db.startTransaction(session => {
        return db.document
          .save('site', tagSettings, { session })
          .then(() => db.document.publish('site', tagSettings, { session }));
      });
    });
  },
});

export default save;
