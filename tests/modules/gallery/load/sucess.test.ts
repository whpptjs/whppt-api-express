import sinon from 'sinon';
import faker from 'faker';

import { GalleryItem } from '../../../../src/modules/gallery';
import load from '../../../../src/modules/gallery/load';
import { TestContext } from '../../../Context';

const { datatype, date, lorem } = faker;

test('item can be loaded', () => {
  const itemId = datatype.uuid();
  const item = {
    domainId: 'domainId',
    defaultAltText: lorem.sentence(),
    createdAt: date.past(),
    updatedAt: date.past(),
  } as GalleryItem;

  const collection = {
    findOne: sinon.fake.resolves({ ...item, _id: itemId }),
  };

  const $mongo = {
    $db: { collection: sinon.fake.returns(collection) },
  };

  const context = TestContext({
    $mongo,
  });

  return load.exec(context, { itemId }).then(response => {
    expect($mongo.$db.collection.firstCall.firstArg).toBe('gallery');
    expect(collection.findOne.firstCall.firstArg).toStrictEqual({ _id: itemId });
    expect(response.item?._id).toEqual(itemId);
  });
});
