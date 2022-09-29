import { MongoDatabaseConnection } from '../Database/Mongo/Connection';
import { HostingMiddleware } from './middleware';

export type HostedMongoInstance = {
  _id: string; // 'Shared-Websites'
  url: string; // mongodb://localhost:27017/?readPreference=primary&ssl=false
};

export type DatabaseHostingConfig = {
  type: 'mongo'; // 'MongoDB"
  instance: HostedMongoInstance;
  db: string; // draft-live-test
  pubDb: string; // pub-live-test
};

type PersistedDatabaseHostingConfig = {
  type: 'mongo'; // 'MongoDB"
  instanceId: string;
  db: string; // draft-live-test
  pubDb: string; // pub-live-test
};

export type SecurityHostingConfig = {
  appKey: string;
  audience: string;
};

export type StorageHostingConfig = {
  provider: string;
  aws?: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export type HostingConfig = {
  apiKey: string;
  database: DatabaseHostingConfig;
  security: SecurityHostingConfig;
  storage: StorageHostingConfig;
};

type PersistedHostingConfig = {
  apiKey: string;
  database: PersistedDatabaseHostingConfig;
  security: SecurityHostingConfig;
  storage: StorageHostingConfig;
};

export type HostingService = {
  getConfig(apiKey: string): Promise<HostingConfig>;
  getConfiguredDatabase(apiKey: string): Promise<DatabaseHostingConfig>;
  middleware: HostingMiddleware;
};

export const HostingService = (
  database: Promise<MongoDatabaseConnection>
): HostingService => {
  const middleware = HostingMiddleware();
  return {
    getConfig(apiKey: string): Promise<HostingConfig> {
      return database.then(connection => {
        const { db: adminDb } = connection.getMongoDatabase();
        return adminDb
          .collection<PersistedHostingConfig>('hosting')
          .findOne({ apiKey })
          .then(config => {
            if (!config)
              throw new Error(`Database config not found for api key: ${apiKey}`);
            // TODO: Support database types. Currently only support mongo instances
            return adminDb
              .collection<HostedMongoInstance>('mongoInstances')
              .findOne({ _id: config.database.instanceId })
              .then(instance => {
                if (!instance)
                  throw new Error(`Database instance not found for api key: ${apiKey}`);
                return { ...config, database: { ...config.database, instance } };
              });
          });
      });
    },
    getConfiguredDatabase(apiKey: string): Promise<DatabaseHostingConfig> {
      return this.getConfig(apiKey).then(config => config.database);
    },
    middleware,
  };
};
