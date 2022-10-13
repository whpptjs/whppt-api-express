import assert from 'assert';
import { uniqBy, find } from 'lodash';
import imagesExtractor from '../../utils/imagesExtractor';
import linksExtractor from '../../utils/linksExtractor';
import { HttpModule } from '../HttpModule';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';

// TODO: collection should not be passed from the client side
const save: HttpModule<{ page: any; collection?: string; user: any; publish: boolean }> =
  {
    authorise({ $roles }, { page, user }) {
      return $roles.validate(user, [page.editorRoles]);
    },
    exec({ $pageTypes, $id, $database }, { page, collection, user, publish }) {
      console.log('🚀 ~ file: save.ts ~ line 14 ~ exec ~ $pageTypes', $pageTypes);
      assert(page, 'Please provide a page.');
      assert(collection, 'Please provide a collection.');

      page._id = page._id || $id.newId();

      const pageType = find($pageTypes, pt => pt.name === page.pageType);

      const usedImages = imagesExtractor(pageType, page);
      const usedLinks = linksExtractor(pageType, page);

      const _collection = pageType ? pageType.collection.name : collection;

      assert(_collection, 'Please provide a page type or collection.');

      return $database.then(database => {
        const { startTransaction, db, document } = database as WhpptMongoDatabase;
        return startTransaction(async session => {
          if (publish) await document.publish(_collection, page, { session });
          await db
            .collection('dependencies')
            .deleteMany({ parentId: page._id }, { session });
          const dependencies = uniqBy(
            [...usedImages, ...usedLinks],
            image => image._id
          ) as any;

          if (dependencies && dependencies.length) {
            await db.collection('dependencies').insertMany(dependencies, { session });
          }

          const savedPage = await document.save(_collection, page, { session });
          page.updatedAt = savedPage.updatedAt;
          await document.recordHistory(
            collection,
            'save',
            { data: page, user },
            {
              session,
            }
          );

          return savedPage;
        }).then(() => page);
      });
    },
  };

export default save;
