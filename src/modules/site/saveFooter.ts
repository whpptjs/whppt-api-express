import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';
import { HttpModule } from '../HttpModule';

const assert = require('assert');

const saveFooter: HttpModule<{ footer: any; user: any; publish: boolean }> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { footer, user, publish }) {
    assert(footer, 'Please provide a footer object.');
    assert(footer.domainId, 'Footer requires a domain id (domainId)');

    footer._id = footer._id || `footer_${footer.domainId}`;

    const dependencies = [] as any[];
    const DEP_COLLECTION = 'dependencies';

    return $database
      .then(database => {
        const { startTransaction, db, document } = database as WhpptMongoDatabase;
        return startTransaction(session => {
          return db
            .collection(DEP_COLLECTION)
            .deleteMany({ parentId: footer._id }, { session })
            .then(() => {
              return Promise.all([
                dependencies.length
                  ? db.collection(DEP_COLLECTION).insertMany(dependencies, { session })
                  : Promise.resolve(),
                document.recordHistory(
                  'site',
                  'saveFooter',
                  { data: footer, user },
                  { session }
                ),
                document.save('site', footer, { session }),
                publish
                  ? document.publish('site', footer, { session })
                  : Promise.resolve(),
                publish
                  ? document.recordHistory(
                      'site',
                      'publishFooter',
                      { data: footer, user },
                      { session }
                    )
                  : Promise.resolve(),
              ]);
            });
        });
      })
      .then(() => footer);
  },
};

export default saveFooter;

// TODO: Add extract images and link back in. Asana task logged
// const { extractFooterImages, extractFooterLinks } = whpptOptions;

// const imageDependencies = extractFooterImages
//   ? map(compact(extractFooterImages(footer)), i => ({
//       _id: $id.newId(),
//       parentId: footer._id,
//       imageId: i,
//       type: 'image',
//     }))
//   : [];
// const linkDependencies = extractFooterLinks
//   ? map(compact(extractFooterLinks(footer)), l => ({
//       _id: $id.newId(),
//       parentId: footer._id,
//       href: l,
//       type: 'link',
//     }))
//   : [];

// const dependencies = [...imageDependencies, ...linkDependencies];
