const { MongoClient } = require('mongodb');

const mongoUrl = process.env.MONGO_URL;
const db = process.env.MONGO_DB;
const pubDb = process.env.MONGO_DB_PUB;

module.exports = ({ $logger, $id }, collections = []) => {
  return MongoClient.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
    .then(client => {
      if ($logger) $logger.info('Connected to mongo on:', mongoUrl);
      const $db = client.db(db);
      const $dbPub = client.db(pubDb);

      const $startTransaction = function (callback) {
        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'local' },
          writeConcern: { w: 'majority' },
        };

        const session = client.startSession();

        // Don't expect withTransaction returns results of the callback https://jira.mongodb.org/browse/NODE-2014
        return session
          .withTransaction(
            () =>
              callback(session).catch(error => {
                $logger.error('An error occured when calling the database', error);
              }),
            transactionOptions
          )
          .then(transactionResults => {
            if (transactionResults) return Promise.resolve();
            $logger.error('An error caused the transaction to fail');
            return Promise.reject('An error caused the transaction to fail');
          })
          .catch(err => {
            $logger.error('An unkown error caused the transaction to fail', err);
            session.abortTransaction();
            return Promise.reject(err);
          })
          .finally(() => session.endSession());
      };

      const $list = function (collection, removed) {
        const cursor = $db.collection(collection);

        if (removed) return cursor.find().toArray();

        return cursor.find({ removed: { $ne: true } }).toArray();
      };

      const $fetch = function (collection, id) {
        return $db
          .collection(collection)
          .find({ _id: id })
          .toArray()
          .then(results => {
            if (!results.length) throw new Error(`Could not find document for Id "${id}" in collection "${collection}"`);

            return results[0];
          });
      };

      const $save = function (collection, doc, { session } = {}) {
        doc = { ...doc, createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(), updatedAt: new Date() };

        return $db
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => doc);
      };

      const $record = function (collection, action, doc, { session } = {}) {
        const historyCollection = collection + 'History';
        const record = {
          ...doc,
          _id: $id(),
          action,
          date: new Date(),
        };
        return $db.collection(historyCollection).insertOne(record, { session });
      };

      const $remove = function (collection, id, { session } = {}) {
        return $db.collection(collection).updateOne(
          { _id: id },
          {
            $set: {
              removed: true,
              removedAt: new Date(),
            },
          },
          { session }
        );
      };

      const $delete = function (collection, id, { session } = {}) {
        return $db.collection(collection).deleteOne({ _id: id }, { session });
      };

      const $publish = function (collection, doc, { session } = {}) {
        doc = {
          ...doc,
          lastPublished: new Date(),
          updatedAt: new Date(),
          published: true,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
        };

        return $db
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => {
            return $dbPub
              .collection(collection)
              .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
              .then(() => doc);
          });
      };

      const $unpublish = function (collection, _id, { session } = {}) {
        return $db
          .collection(collection)
          .updateOne({ _id }, { $set: { published: false } }, { session })
          .then(() => {
            return $dbPub.collection(collection).deleteOne({ _id }, { session });
          });
      };

      const devEnv = process.env.DRAFT === 'true' && !!process.env.MONGO_DB_PUB;

      return Promise.all([createCollections($db, collections), devEnv ? createCollections($dbPub, collections) : Promise.resolve()]).then(() => {
        return {
          $db,
          $dbPub,
          $list,
          $fetch,
          $save,
          $record,
          $publish,
          $unpublish,
          $remove,
          $delete,
          $startTransaction,
        };
      });
    })
    .catch(err => {
      if ($logger) {
        $logger.error('Mongo Connection Failed ....');
        $logger.error(err);
      }
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });
};

function createCollections(db, collections) {
  return db
    .listCollections()
    .toArray()
    .then(collectionsList => {
      const missingCollections = collections.filter(col => !collectionsList.find(cl => cl.name === col));

      if (!collectionsList.find(cl => cl.name === 'site')) missingCollections.push('site');
      if (!collectionsList.find(cl => cl.name === 'siteHistory')) missingCollections.push('siteHistory');

      return Promise.all(missingCollections.map(mc => db.createCollection(mc)));
    });
}
