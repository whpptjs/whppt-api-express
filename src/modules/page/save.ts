import assert from 'assert';
import { uniqBy, find } from 'lodash';
import imagesExtractor from '../../utils/imagesExtractor';
import linksExtractor from '../../utils/linksExtractor';
import { HttpModule } from '../HttpModule';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';

// TODO: collection should not be passed from the client side
const save: HttpModule<{ page: any; collection: string; user: any; publish: boolean }> = {
  authorise({ $roles }, { page, user }) {
    return $roles.validate(user, [page.editorRoles]);
  },
  exec({ $pageTypes, $id, $database }, { page, collection, user, publish }) {
    assert(page, 'Please provide a page.');
    assert(collection, 'Please provide a collection.');

    page._id = page._id || $id.newId();

    const pageType = find($pageTypes, pt => pt.name === page.pageType);

    const usedImages = imagesExtractor(pageType, page);
    const usedLinks = linksExtractor(pageType, page);

    return $database.then(database => {
      const { startTransaction, db, document } = database as WhpptMongoDatabase;
      return startTransaction(async session => {
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

        const savedPage = await document.save(collection, page, { session });
        await document.recordHistory(
          collection,
          'save',
          { data: page, user },
          {
            session,
          }
        );

        if (publish) await document.publish(collection, savedPage, { session });
        return savedPage;
      });
    });
  },
};

export default save;
