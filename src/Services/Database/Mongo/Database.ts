import { Db, MongoClient } from 'mongodb';
import { WhpptDatabase } from '..';

export type WhpptMongoDatabase = WhpptDatabase & {
  client: MongoClient;
  db: Db;
  pubDb?: Db;
};

export type MongoDabaseFactory = (
  client: MongoClient,
  db: Db,
  pubDb?: Db
) => WhpptMongoDatabase;

export const WhpptMongoDatabase: MongoDabaseFactory = (client, db, pubDb) => {
  const database: WhpptMongoDatabase = {
    client,
    db,
    pubDb,
    save() {},
  };
  return database;
};
