import { HostingService } from '../Hosting';
import { LoggerService } from '../Logger';
import { DatabaseMiddleware } from './middleware';
import { MongoDatabaseConnection } from './Mongo/Connection';

export type DatabaseConnection = {
  getDatabase(): WhpptDatabase;
};

export type WhpptDatabase = {
  save(type: string, value: any): void;
};

export type DatabaseServiceFactory = (
  logger: LoggerService,
  hosting: HostingService,
  adminDb: Promise<MongoDatabaseConnection>
) => DatabaseService;

export type DatabaseService = {
  adminDb: Promise<MongoDatabaseConnection>;
  getConnection(apiKey: string): Promise<DatabaseConnection>;
  middleware: DatabaseMiddleware;
};

export const DatabaseService: DatabaseServiceFactory = (logger, hosting, adminDb) => {
  const connections: Record<string, DatabaseConnection> = {};

  const getConnection = (apiKey: string) => {
    return hosting.getConfiguredDatabase(apiKey).then(config => {
      const connectionKey = `${config.type}_${config.instance._id}`;
      if (connections[connectionKey]) return Promise.resolve(connections[connectionKey]);

      switch (config.type) {
        case 'mongo':
          return MongoDatabaseConnection(logger, config).then(connection => {
            connections[connectionKey] = connection;

            // TODO: hook up disconnection events so that we can remove the connection
            return connection;
          });
        default:
          throw new Error('Database connection could not be created');
      }
    });
  };
  const middleware = DatabaseMiddleware(logger, getConnection, adminDb);
  return {
    adminDb,
    getConnection,
    middleware,
  };
};
