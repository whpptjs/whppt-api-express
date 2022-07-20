import faker from 'faker';

import { GalleryItem } from '../../../../src/modules/gallery';
import save from '../../../../src/modules/gallery/save';
import { TestContext } from '../../../Context';

const { date, lorem } = faker;

test('domain id required', () => {
  const item = {
    defaultAltText: lorem.sentence(),
    createdAt: date.past(),
    updatedAt: date.past(),
  } as GalleryItem;

  const context = TestContext({});

  try {
    save.exec(context, { item });
  } catch (error) {
    expect(`${error}`).toEqual('AssertionError [ERR_ASSERTION]: Gallery item requires a domain id');
  }
});
