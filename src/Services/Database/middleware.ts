import { NextFunction, Response } from 'express';
import { MongoDatabaseConnection } from '../../Services/Database/Mongo/Connection';
import { LoggerService } from '../../Services/Logger';
import { DatabaseConnection } from '../../Services/Database';

export type DatabaseMiddleware = {
  waitForAdminDbConnection(req: any, res: Response, next: NextFunction): void;
  waitForApiDbConnection(req: any, res: Response, next: NextFunction): void;
};

export type DatabaseMiddlewareFactory = (
  logger: LoggerService,
  getConnection: (apiKey: string) => Promise<DatabaseConnection>,
  adminDb: Promise<MongoDatabaseConnection>
) => DatabaseMiddleware;

export const DatabaseMiddleware: DatabaseMiddlewareFactory = (
  logger,
  getConnection,
  adminDb
) => {
  return {
    waitForAdminDbConnection(_, res, next) {
      console.log('🚀  waitForAdminDbConnection:');
      adminDb
        .then(() => next())
        .catch(err => {
          const msg = 'Could not connect to the admin DB. The service as shut down.';
          logger.error(`${msg} : ${err}`);
          res.status(500).send(msg);
          process.exit(1);
        });
    },
    waitForApiDbConnection(req, res, next) {
      getConnection(req.apiKey)
        .then(() => next())
        .catch(err => {
          const msg = 'The database connection could not be established';
          logger.error(`${msg} : ${err}`);
          res.status(500).send(msg);
        });
    },
  };
};
