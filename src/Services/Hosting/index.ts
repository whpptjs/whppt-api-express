import assert from 'assert';
import { MongoDatabaseConnection } from '../Database/Mongo/Connection';
import { adminDbConfig } from './adminDbConfig';
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
  cors: string[];
};

type PersistedHostingConfig = {
  apiKey: string;
  database: PersistedDatabaseHostingConfig;
  security: SecurityHostingConfig;
  storage: StorageHostingConfig;
  cors: string[];
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
      if (apiKey === 'legacy') {
        return Promise.resolve().then(() => {
          assert(process.env.MONGO_URL, 'MONGO_URL env variable is required');
          assert(process.env.MONGO_DB, 'MONGO_DB env variable is required');
          assert(process.env.MONGO_DB_PUB, 'MONGO_DB_PUB env variable is required');
          assert(process.env.APP_KEY, 'APP_KEY env variable is required');
          assert(process.env.JWT_AUDIENCE, 'JWT_AUDIENCE env variable is required');
          assert(process.env.S3_BUCKET, 'S3_BUCKET env variable is required');
          assert(
            process.env.S3_ACCESS_KEY_ID,
            'S3_ACCESS_KEY_ID env variable is required'
          );
          assert(
            process.env.S3_SECRET_ACCESS_KEY,
            'S3_SECRET_ACCESS_KEY env variable is required'
          );
          return {
            apiKey: 'legacy',
            database: {
              type: 'mongo',
              instance: {
                _id: 'legacy',
                url: process.env.MONGO_URL,
              },
              db: process.env.MONGO_DB,
              pubDb: process.env.MONGO_DB_PUB,
            },
            security: { appKey: process.env.APP_KEY, audience: process.env.JWT_AUDIENCE },
            storage: {
              provider: 'aws',
              aws: {
                region: 'ap-southeast-2',
                bucket: process.env.S3_BUCKET,
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
              },
            },
            cors: [],
          };
        });
      }

      return database.then(connection => {
        return connection
          .getMongoDatabase(Promise.resolve(adminDbConfig))
          .then(({ db: adminDb }) => {
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
                      throw new Error(
                        `Database instance not found for api key: ${apiKey}`
                      );
                    return { ...config, database: { ...config.database, instance } };
                  });
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
