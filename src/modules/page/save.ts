import assert from 'assert';
import { uniqBy, find } from 'lodash';
import imagesExtractor from '../../utils/imagesExtractor';
import linksExtractor from '../../utils/linksExtractor';
import { HttpModule } from '../HttpModule';
import { WhpptMongoDatabase } from '../../Services/Database/Mongo/Database';
import galleryItemsExtractor from '../../utils/galleryItemsExtractor';

// TODO: collection should not be passed from the client side
const save: HttpModule<{ page: any; collection?: string; user: any; publish: boolean }> =
  {
    authorise({ $identity }, { user }) {
      // return $roles.validate(user, [page.editorRoles]);
      return $identity.isUser(user);
    },
    exec(context, { page, collection, user, publish }) {
      assert(page, 'Please provide a page.');
      const { $pageTypes, $id, $database, $publishing } = context;
      page._id = page._id || $id.newId();

      const pageType = find($pageTypes, pt => pt.name === page.pageType);

      const usedImages = imagesExtractor(pageType, page);
      const usedGalleryItems = galleryItemsExtractor(pageType, page);
      const usedLinks = linksExtractor(pageType, page);

      const _collection = pageType ? pageType.collection.name : collection;

      assert(_collection, 'Please provide a page type or collection.');

      return $database.then(database => {
        const { startTransaction, db, document } = database as WhpptMongoDatabase;
        return startTransaction(async session => {
          if (page?.header?.startDate)
            page.header.startDate = new Date(page.header.startDate);
          if (page?.header?.endDate) page.header.endDate = new Date(page.header.endDate);
          if (page?.header?.date) page.header.date = new Date(page.header.date);
          if (page?.slug) page.slug = page?.slug.toLowerCase();

          if (publish) await document.publish(_collection, page, { session });

          if (publish && $publishing.onPublish)
            await $publishing.onPublish(context, page, _collection);

          await db
            .collection('dependencies')
            .deleteMany({ parentId: page._id }, { session });
          const dependencies = uniqBy(
            [...usedImages, ...usedLinks, ...usedGalleryItems],
            image => image._id
          ) as any;

          if (dependencies && dependencies.length) {
            await db.collection('dependencies').insertMany(dependencies, { session });
          }

          const savedPage = await document.save(_collection, page, { session });
          page.updatedAt = savedPage.updatedAt;
          await document.recordHistory(
            _collection,
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
