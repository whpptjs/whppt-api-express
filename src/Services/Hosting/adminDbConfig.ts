import { DatabaseHostingConfig } from '.';

export const adminDbConfig: DatabaseHostingConfig = {
  type: 'mongo',
  instance: { _id: 'whppt-shared', url: process.env.MONGO_URL || '' },
  db: process.env.MONGO_ADMIN_DB || 'WhpptAdmin',
  pubDb: '',
};
