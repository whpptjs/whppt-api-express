import faker from 'faker';
import sinon from 'sinon';
import search, { SearchParams } from '../../../../src/modules/gallery/search';
import { TestContext } from '../../../Context';

const { datatype } = faker;

test('filter for tags', () => {
  const toArray = sinon.fake.resolves([]);
  const limit = sinon.fake.returns({ toArray });
  const skip = sinon.fake.returns({ limit });
  const collection = { find: sinon.fake.returns({ skip }) };
  const $mongo = { $db: { collection: sinon.fake.returns(collection) } };
  const context = TestContext({ $mongo });

  const args = { domainId: datatype.uuid(), type: 'image', filterTag: 'test' };

  return search.exec(context, args as SearchParams).then(() => {
    expect($mongo.$db.collection.firstCall.firstArg).toBe('gallery');
    expect(collection.find.firstCall.firstArg).toStrictEqual({
      domainId: args.domainId,
      type: 'image',
      tags: { $elemMatch: { $eq: 'test' } },
    });
  });
});
