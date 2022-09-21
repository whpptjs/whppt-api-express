import {
  ClientSession,
  Db,
  MongoClient,
  MongoClientOptions,
  ReadPreference,
  TransactionOptions,
} from 'mongodb';
import { DomainEvent } from '../Events/CreateEvent';
import assert from 'assert';
import { LoggerService } from '../Logger';
import { IdService } from '../Id';
import { WhpptConfig } from '../../Config';
const { pick } = require('lodash');

const mongoUrl = process.env.MONGO_URL;
const db = process.env.MONGO_DB;
const pubDb = process.env.MONGO_DB_PUB;

export type WhpptMongoArgs = {
  $logger: LoggerService;
  $id: IdService;
  config: WhpptConfig;
};

export type MongoServiceSave = <T>(
  collection: string,
  doc: T,
  options?: { session?: ClientSession }
) => Promise<T>;

export type MongoServiceSaveToPubWithEvents = <
  T extends { _id: string; createdAt: Date; updatedAt: Date }
>(
  collection: string,
  doc: T,
  events: DomainEvent[],
  options: { session: ClientSession }
) => Promise<T>;

export type MongoServiceDelete = (
  collection: string,
  id: string,
  options?: { session?: ClientSession }
) => Promise<any>;

export type MongoServiceStartTransaction = (
  callback: (session: ClientSession) => Promise<any>
) => Promise<any>;

export type MongoService = {
  $db: Db;
  $dbPub: Db;
  $save: MongoServiceSave;
  $saveToPubWithEvents: MongoServiceSaveToPubWithEvents;
  $delete: MongoServiceDelete;
  $startTransaction: MongoServiceStartTransaction;
  $unpublish: (
    collection: string,
    _id: string,
    options?: { session?: ClientSession }
  ) => Promise<void>;
  ensureCollections: (collections: string[]) => Promise<void>;
};
export type MongoServiceConstructor = (args: WhpptMongoArgs) => Promise<MongoService>;

export const Mongo: MongoServiceConstructor = ({ $logger, $id }: WhpptMongoArgs) => {
  if (!mongoUrl) {
    $logger.error('Mongo connection failed, missing URL ....');
    process.exit(1);
  }
  const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  } as MongoClientOptions;

  return MongoClient.connect(mongoUrl, options)
    .then(client => {
      if ($logger) $logger.info('Connected to mongo on:', mongoUrl);
      const $db = client.db(db);
      const $dbPub = client.db(pubDb);

      const $startTransaction = function (
        callback: (session: ClientSession) => Promise<any>
      ) {
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
              $logger.error('An error occured when calling the database', error);
              return Promise.reject({ error, status: 500 });
            });
          }, transactionOptions)
          .then(transactionResults => {
            if (transactionResults) return Promise.resolve(result);
            $logger.error('An error caused the transaction to fail');
            return Promise.reject('An error caused the transaction to fail');
          })
          .finally(() => session.endSession());
      };

      const $list = function (collection: string, removed: boolean) {
        const cursor = $db.collection(collection);

        if (removed) return cursor.find().toArray();

        return cursor.find({ removed: { $ne: true } }).toArray();
      };

      const $fetch = function (collection: string, id: string) {
        return $db
          .collection(collection)
          .find({ _id: id })
          .toArray()
          .then(results => {
            if (!results.length)
              throw new Error(
                `Could not find document for Id "${id}" in collection "${collection}"`
              );

            return results[0];
          });
      };

      const $save = function (
        collection: string,
        doc: any,
        { session }: { session?: ClientSession } = {}
      ) {
        doc = {
          _id: $id.newId(),
          ...doc,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: new Date(),
        };

        return $db
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => doc);
      };

      const $saveToPubWithEvents: MongoServiceSaveToPubWithEvents = function (
        collection,
        doc,
        events,
        { session }
      ) {
        assert(session, 'Session is required');
        doc = {
          ...doc,
          _id: doc._id || $id.newId(),
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          updatedAt: new Date(),
        };

        const eventCollection = collection + 'Events';

        return $dbPub
          .collection(collection)
          .updateOne({ _id: doc._id }, { $set: doc }, { session, upsert: true })
          .then(() => $dbPub.collection(eventCollection).insertMany(events, { session }))
          .then(() => doc);
      };

      const $record = function (
        collection: string,
        action: string,
        doc: any,
        { session }: { session?: ClientSession } = {}
      ) {
        const historyCollection = collection + 'History';
        const { data, user } = doc;
        const record = {
          _id: $id.newId(),
          data,
          action,
          user: pick(user, [
            '_id',
            'username',
            'email',
            'firstName',
            'lastName',
            'roles',
          ]),
          date: new Date(),
        } as any;
        return $db.collection(historyCollection).insertOne(record, { session });
      };

      const $remove = function (
        collection: string,
        id: string,
        { session }: { session?: ClientSession } = {}
      ) {
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

      const $delete = function (
        collection: string,
        id: string,
        { session }: { session?: ClientSession } = {}
      ) {
        return $db
          .collection(collection)
          .deleteOne({ _id: id }, { session })
          .then(() => {});
      };

      const $publish = function (
        collection: string,
        doc: any,
        { session }: { session?: ClientSession } = {}
      ) {
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

      const $unpublish = function (
        collection: string,
        _id: string,
        { session }: { session?: ClientSession } = {}
      ) {
        return $db
          .collection(collection)
          .updateOne({ _id }, { $set: { published: false } }, { session })
          .then(() => {
            return $dbPub
              .collection(collection)
              .deleteOne({ _id }, { session })
              .then(() => {});
          });
      };

      const devEnv = process.env.DRAFT === 'true' && !!process.env.MONGO_DB_PUB;

      return {
        $db,
        $dbPub,
        $list,
        $fetch,
        $save,
        $saveToPubWithEvents,
        $record,
        $publish,
        $unpublish,
        $remove,
        $delete,
        $startTransaction,
        ensureCollections: (collections: string[]) =>
          Promise.all([
            createCollections($db, collections),
            devEnv ? createCollections($dbPub, collections) : Promise.resolve([]),
          ]).then(() => {}),
      };
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
