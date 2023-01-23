import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { WhpptMongoDatabase } from 'src/Services/Database/Mongo/Database';

const publishAll: HttpModule<{ domainId: string }, void> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $database }, { domainId }) {
    assert(domainId, 'Gallery requires a domain id');
    assert(domainId, 'Domain Id is required');

    return $database.then(database => {
      const { startTransaction, pubDb, db } = database as WhpptMongoDatabase;
      if (!pubDb) throw new Error('No Pub DB');

      return db
        .collection('gallery')
        .find({})
        .toArray()
        .then(items => {
          if (!(items && items.length)) return;

          return startTransaction(session => {
            const promiseChain = items.reduce((prev: any, e: any) => {
              return prev.then(() =>
                pubDb
                  .collection('gallery')
                  .updateOne({ _id: e._id }, { $set: e }, { session, upsert: true })
              );
            }, Promise.resolve());

            return promiseChain.then(() => ({}));
          });
        });
    });
  },
};

export default publishAll;
