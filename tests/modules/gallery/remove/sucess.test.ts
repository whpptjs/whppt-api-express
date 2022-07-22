import sinon from 'sinon';
import faker from 'faker';

import remove from '../../../../src/modules/gallery/remove';
import { TestContext } from '../../../Context';

const { datatype } = faker;

test.skip('item can be removed', () => {
  const itemId = datatype.uuid();

  const collection = {
    deleteOne: sinon.fake.resolves({}),
  };

  const $mongo = {
    $db: { collection: sinon.fake.returns(collection) },
  };

  const context = TestContext({
    $mongo,
  });

  return remove.exec(context, { itemId }).then(() => {
    expect($mongo.$db.collection.firstCall.firstArg).toBe('gallery');
    expect(collection.deleteOne.firstCall.firstArg).toStrictEqual({ _id: itemId });
  });
});
