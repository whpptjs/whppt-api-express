import assert from 'assert';
import {
  ClientSession,
  Db,
  MongoClient,
  ReadPreference,
  TransactionOptions,
} from 'mongodb';
import { LoggerService } from '../../Logger';
import {
  FetchAllDocuments,
  WhpptDatabase,
  DatabaseDocument,
  FetchDocument,
  SaveDocument,
  RecordHistory,
  RemoveDocument,
  DeleteDocument,
  PublishDocument,
  UnpublishDocument,
  EnsureCollections,
  QueryDocuments,
  CountDocuments,
  SaveDocumentWithEvents,
  QueryDistinct,
  QueryDocument,
  PublishDocumentWithEvents,
} from '..';
import { IdService } from '../../Id/index';
import { pick } from 'lodash';

export type WhpptMongoDatabase = WhpptDatabase & {
  client: MongoClient;
  db: Db;
  pubDb?: Db;
  /**
   * @deprecated avoid using db directly. If you need to use db.
   */
  $db: Db;
  /**
   * @deprecated avoid using dbPub directly. If you need to use pubDb.
   */
  $dbPub?: Db;
};

export type MongoDabaseFactory = (
  logger: LoggerService,
  id: IdService,
  client: MongoClient,
  db: Db,
  pubDb?: Db
) => WhpptMongoDatabase;

export const WhpptMongoDatabase: MongoDabaseFactory = (logger, id, client, db, pubDb) => {
  const startTransaction = function (callback: (session: ClientSession) => Promise<any>) {
    const transactionOptions = {
      readPreference: ReadPreference.primary,
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
    } as TransactionOptions;

    const session = client.startSession();

    let result: any;

    return session
      .withTransaction(() => {
        return callback(session).catch(error => {
          logger.error('An error occured when calling the database', error);
          return Promise.reject({ error, status: 500 });
        });
      }, transactionOptions)
      .then(transactionResults => {
        if (transactionResults) return Promise.resolve(result);
        logger.error('An error caused the transaction to fail');
        return Promise.reject('An error caused the transaction to fail');
      })
      .finally(() => session.endSession());
  };

  const fetchAllDocuments: FetchAllDocuments = <T extends DatabaseDocument>(
    collection: string,
    showRemoved: boolean
  ) => {
    const _collection = db.collection(collection);
    const query = showRemoved
      ? _collection.find<T>({})
      : _collection.find<T>({ removed: { $ne: true } });
    return query.toArray();
  };

  const fetchDocument: FetchDocument = <T extends DatabaseDocument>(
    collection: string,
    id: string
  ) => {
    return db
      .collection(collection)
      .find<T>({ _id: id })
      .toArray()
      .then(results => {
        if (!results.length)
          throw new Error(
            `Could not find document for Id "${id}" in collection "${collection}"`
          );

        return results[0];
      });
  };

  const queryDocument: QueryDocument = <T extends DatabaseDocument>(
    collection: string,
    query: {
      filter: { [key: string]: any };
    }
  ) => {
    return db.collection(collection).findOne<T>(query.filter);
  };

  const queryDocuments: QueryDocuments = <T extends DatabaseDocument>(
    collection: string,
    query: {
      filter: { [key: string]: any };
      projection?: { [key: string]: any };
      limit?: number;
      skip?: number;
      sort?: { [key: string]: any };
    },
    options = {}
  ) => {
    let _query = db.collection(collection).find<T>(query.filter, options);
    if (query.projection) _query = _query.project(query.projection);
    if (query.sort) _query = _query.sort(query.sort);
    if (query.limit) _query = _query.limit(query.limit);
    if (query.skip) _query = _query.skip(query.skip);

    return _query.toArray();
  };
  const queryDistinct: QueryDistinct = (
    collection: string,
    query: {
      distinct: string;
    }
  ) => {
    return db.collection(collection).distinct<string>(query.distinct);
  };

  const countDocuments: CountDocuments = (collection, query, options = {}) => {
    return db.collection(collection).countDocuments(query.filter, options);
  };

  const saveDocument: SaveDocument = <T extends DatabaseDocument>(
    collection: string,
    doc: T,
    { session }: { session?: ClientSession } = {}
  ) => {
    doc = {
      ...doc,
      _id: doc._id || id.newId(),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    return db
      .collection(collection)
      .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
      .then(() => doc);
  };

  const saveWithEvents: SaveDocumentWithEvents = (
    collection,
    doc,
    events,
    { session }
  ) => {
    doc = {
      ...doc,
      _id: doc._id || id.newId(),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const eventCollection = collection + 'Events';

    return db
      .collection(collection)
      .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
      .then(() => db.collection(eventCollection).insertMany(events, { session }))
      .then(() => doc);
  };

  const recordHistory: RecordHistory = <T extends { data: DatabaseDocument; user: any }>(
    collection: string,
    action: string,
    value: T,
    { session }: { session?: ClientSession } = {}
  ) => {
    const historyCollection = collection + 'History';
    const { data, user } = value;
    const record = {
      _id: id.newId(),
      data,
      action,
      user: pick(user, ['_id', 'username', 'email', 'firstName', 'lastName', 'roles']),
      date: new Date(),
    } as any;
    return db
      .collection(historyCollection)
      .insertOne(record, { session })
      .then(() => {});
  };

  const removeDocument: RemoveDocument = (
    collection: string,
    id: string,
    { session }: { session?: ClientSession } = {}
  ) => {
    return db
      .collection(collection)
      .updateOne(
        { _id: id },
        {
          $set: {
            removed: true,
            removedAt: new Date(),
          },
        },
        { session }
      )
      .then(() => {});
  };

  const deleteDocument: DeleteDocument = (
    collection: string,
    id: string,
    { session }: { session?: ClientSession } = {}
  ) => {
    return db
      .collection(collection)
      .deleteOne({ _id: id }, { session })
      .then(() => {});
  };

  const publishDocument: PublishDocument = (
    collection: string,
    doc: any,
    { session }: { session?: ClientSession } = {}
  ) => {
    assert(pubDb, 'Publish database is not configured');
    doc.lastPublished = new Date();
    doc.published = true;
    return db
      .collection(collection)
      .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
      .then(() => {
        return pubDb
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => doc);
      });
  };

  const unpublishDocument: UnpublishDocument = (
    collection: string,
    _id: string,
    { session }: { session?: ClientSession } = {}
  ) => {
    assert(pubDb, 'Publish database is not configured');

    return db
      .collection(collection)
      .updateOne({ _id }, { $set: { published: false } }, { session })
      .then(() => {
        return pubDb
          .collection(collection)
          .deleteOne({ _id }, { session })
          .then(() => {});
      });
  };
  const publishDocumentWithEvents: PublishDocumentWithEvents = (
    collection,
    doc,
    events,
    { session }
  ) => {
    assert(pubDb, 'Publish database is not configured');

    doc = {
      ...doc,
      _id: doc._id || id.newId(),
      createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    const eventCollection = collection + 'Events';

    return db
      .collection(collection)
      .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
      .then(() => {
        return pubDb
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => pubDb.collection(eventCollection).insertMany(events, { session }));
      })
      .then(() => doc);
  };

  //TODO: Performance: EnsureCollections. Do this for each configured db when the app starts or a new api key is created. For now its done on each request.
  const ensureCollections: EnsureCollections = (collections: string[]) => {
    return Promise.all([
      createCollections(db, collections),
      pubDb ? createCollections(pubDb, collections) : Promise.resolve(),
    ]).then(() => {});
  };

  const database: WhpptMongoDatabase = {
    client,
    db,
    pubDb,
    $db: db,
    $dbPub: pubDb,
    startTransaction,
    $list: fetchAllDocuments,
    fetchAllDocuments,
    ensureCollections,
    queryDocuments,
    countDocuments,
    queryDistinct,
    document: {
      fetch: fetchDocument,
      query: queryDocument,
      save: saveDocument,
      saveWithEvents: saveWithEvents,
      recordHistory,
      remove: removeDocument,
      delete: deleteDocument,
      publish: publishDocument,
      publishWithEvents: publishDocumentWithEvents,
      unpublish: unpublishDocument,
    },
    $startTransaction: startTransaction,
    $fetch: fetchDocument,
    $save: saveDocument,
    $record: recordHistory,
    $remove: removeDocument,
    $delete: deleteDocument,
    $publish: publishDocument,
    $unpublish: unpublishDocument,
  };
  return database;
};

function createCollections(db: Db, collections: string[]) {
  return db
    .listCollections()
    .toArray()
    .then(collectionsList => {
      const missingCollections = collections.filter(
        col => !collectionsList.find(cl => cl.name === col)
      );

      if (!collectionsList.find(cl => cl.name === 'site'))
        missingCollections.push('site');
      if (!collectionsList.find(cl => cl.name === 'siteHistory'))
        missingCollections.push('siteHistory');

      return Promise.all(missingCollections.map(mc => db.createCollection(mc)));
    });
}
