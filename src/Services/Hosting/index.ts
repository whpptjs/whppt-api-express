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

export type HostingConfig = {
  apiKey: string;
  database: DatabaseHostingConfig;
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
        const { db } = connection.getMongoDatabase();
        return db
          .collection<HostingConfig>('hosting')
          .findOne({ apiKey })
          .then(config => {
            if (!config)
              throw new Error(`Database config not found for api key: ${apiKey}`);
            return config;
          });
      });
    },
    getConfiguredDatabase(apiKey: string): Promise<DatabaseHostingConfig> {
      return this.getConfig(apiKey).then(config => config.database);
    },
    middleware,
  };
};
