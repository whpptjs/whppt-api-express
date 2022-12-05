// import { Tagging } from './index';

const developerTags = [
  {
    id: 'testTag',
    slug: '/testTag',
    values: [{ id: 'testValue', slug: '/testValue' }],
  },
];
const savedTags = [
  {
    id: 'savedTag',
    slug: '/savedTag',
    values: [{ id: 'savedValue', slug: '/savedValue' }],
  },
];

it('Should save configured tags excluding developer tags', async () => {
  const options = {} as any;
  // Tagging(options, developerTags);

  const mockSave = jest.fn(() => Promise.resolve());
  const mockPublish = jest.fn(() => Promise.resolve());

  const context = {
    $database: Promise.resolve({
      startTransaction: (cb: any) => {
        return cb('testSession');
      },
      document: { save: mockSave, publish: mockPublish },
    }),
  } as any;

  await options.modules.tags.save.exec(context, {
    domainId: 'test',
    tags: [...developerTags, ...savedTags],
  });

  const saveArgs = mockSave.mock.calls[0] as any;
  const publishArgs = mockPublish.mock.calls[0] as any;

  expect(saveArgs[0]).toBe('site');
  expect(saveArgs[1]._id).toBe('tags_test');
  expect(saveArgs[2].session).toBeDefined();
  expectTag(saveArgs[1].tags[0], savedTags[0]);

  expect(publishArgs[0]).toBe('site');
  expect(publishArgs[1]._id).toBe('tags_test');
  expect(publishArgs[2].session).toBeDefined();
  expectTag(publishArgs[1].tags[0], savedTags[0]);
});

const expectTag = (actualTag: any, expectedTag: any) => {
  expect(actualTag.id).toBe(expectedTag.id);
  expect(actualTag.slug).toBe(expectedTag.slug);
  actualTag.values.forEach((tag: any, index: any) =>
    expectValue(tag, expectedTag.values[index])
  );
};

const expectValue = (actualValue: any, excpectedTagValue: any) => {
  expect(actualValue.id).toBe(excpectedTagValue.id);
};

export {};
