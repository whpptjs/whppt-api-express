import faker from 'faker';
import sinon from 'sinon';
import { GalleryItem } from '../../../src/modules/gallery';
import search from '../../../src/modules/gallery/search';
import { TestContext } from '../../Context';

const { datatype, date, lorem } = faker;

test('load first page without args', () => {
  const galleryItems = [] as GalleryItem[];
  const domainId = datatype.uuid();

  for (let i = 0; i < 5; i++) {
    galleryItems.push({
      _id: datatype.uuid(),
      domainId,
      defaultAltText: lorem.sentence(),
      createdAt: date.past(),
      updatedAt: date.past(),
    });
  }

  const collection = {
    find: sinon.fake.returns({
      toArray: sinon.fake.resolves(galleryItems),
    }),
  };

  const $mongo = {
    $db: {
      collection: sinon.fake.returns(collection),
    },
  };

  const context = TestContext({
    $mongo,
  });

  const args = { domainId: datatype.uuid() };

  return search.exec(context, args).then(response => {
    expect($mongo.$db.collection.firstCall.firstArg).toBe('gallery');
    expect(collection.find.firstCall.firstArg).toStrictEqual({ domainId: args.domainId });
    expect(response.items.length).toEqual(5);
  });
});
