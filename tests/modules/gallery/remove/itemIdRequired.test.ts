import remove from '../../../../src/modules/gallery/remove';
import { TestContext } from '../../../Context';

test('item id required', () => {
  const context = TestContext({});

  try {
    remove.exec(context, {});
  } catch (error) {
    expect(`${error}`).toEqual('AssertionError [ERR_ASSERTION]: itemId is required');
  }
});
