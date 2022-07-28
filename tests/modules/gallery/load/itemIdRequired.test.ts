import load from '../../../../src/modules/gallery/load';
import { TestContext } from '../../../Context';

test('item id required', () => {
  const context = TestContext({});

  try {
    load.exec(context, {});
  } catch (error) {
    expect(`${error}`).toEqual('AssertionError [ERR_ASSERTION]: itemId is required');
  }
});
