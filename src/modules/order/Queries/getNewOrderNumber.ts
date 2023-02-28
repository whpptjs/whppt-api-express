import { Db } from 'mongodb';
import assert from 'assert';
export type QueryMemberTier = (database: Db) => Promise<string>;

export const getNewOrderNumber: QueryMemberTier = db => {
  return db
    .collection('counters')
    .findOneAndUpdate(
      { _id: 'order_count' },
      { $inc: { sequence_value: 1 } },
      { returnDocument: 'after' }
    )
    .then(({ value }) => {
      assert(value?.sequence_value, 'Something went wrong getting new order number');
      return value.sequence_value;
    });
};
