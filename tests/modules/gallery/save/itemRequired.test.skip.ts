import save from '../../../../src/modules/gallery/save';
import { TestContext } from '../../../Context';

test('domain id required', () => {
  const context = TestContext({});

  try {
    save.exec(context, {});
  } catch (error) {
    expect(`${error}`).toEqual('AssertionError [ERR_ASSERTION]: Gallery item is required');
  }
});
