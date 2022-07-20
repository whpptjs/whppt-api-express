import sinon from 'sinon';
import faker from 'faker';

import { GalleryItem } from '../../../../src/modules/gallery';
import save from '../../../../src/modules/gallery/save';
import { TestContext } from '../../../Context';

const { datatype, date, lorem } = faker;

test('new item can be saved', () => {
  const itemId = datatype.uuid();
  const item = {
    domainId: 'domainId',
    defaultAltText: lorem.sentence(),
    createdAt: date.past(),
    updatedAt: date.past(),
  } as GalleryItem;

  const $id = sinon.fake.returns(itemId);
  const $mongo = {
    $save: sinon.fake.resolves({ ...item, _id: itemId }),
  };

  const context = TestContext({
    $id,
    $mongo,
  });

  return save.exec(context, { item }).then(response => {
    expect($mongo.$save.firstCall.args[0]).toBe('gallery');
    expect($mongo.$save.firstCall.args[1]).toStrictEqual(item);
    expect(response.item?._id).toEqual(itemId);
  });
});
