import { MongoClient, MongoClientOptions } from 'mongodb';
import assert from 'assert';
import { DatabaseHostingConfig } from '../../Hosting';
import { DatabaseConnection } from '..';
import { WhpptMongoDatabase } from './Database';
import { LoggerService } from '../../Logger';
import { IdService } from '../../Id';

export type MongoDatabaseConnection = DatabaseConnection & {
  _connection: MongoClient;
  getMongoDatabase: () => WhpptMongoDatabase;
};

export type MongoDatabaseConnectionFactory = (
  logger: LoggerService,
  id: IdService,
  config: DatabaseHostingConfig
) => Promise<MongoDatabaseConnection>;

export const MongoDatabaseConnection: MongoDatabaseConnectionFactory = (
  logger,
  id,
  config
) => {
  return Promise.resolve().then(() => {
    assert(config.instance.url, 'Mongo url is required');
    assert(config.db, 'Mongo database is required');
    const options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as MongoClientOptions;

    return MongoClient.connect(config.instance.url, options)
      .then(mongoClient => {
        const db = mongoClient.db(config.db);
        const pubDb = config.pubDb ? mongoClient.db(config.pubDb) : undefined;

        const database = WhpptMongoDatabase(logger, id, mongoClient, db, pubDb);
        const connection: MongoDatabaseConnection = {
          _connection: mongoClient,
          getDatabase: () => database,
          getMongoDatabase: () => database,
        };
        return connection;
      })
      .catch(err => {
        logger.error('Mongo Connection Failed ....');
        logger.error(err);
        throw err;
      });
  });
};
