import { compact, map } from 'lodash';
import { WhpptConfig } from '.';

export type BuildCollections = (config: WhpptConfig) => string[];

export const buildCollections: BuildCollections = config => {
  const _collections = config.collections || [];
  const pageTypeCollections = compact(
    map(
      config.pageTypes,
      pageType => (pageType.collection && pageType.collection.name) || pageType.key
    )
  );
  const pageTypeHistoryCollections = map(
    pageTypeCollections,
    pageTypeName => pageTypeName + 'History'
  );

  return [
    'dependencies',
    'gallery',
    'users',
    ..._collections,
    ...pageTypeCollections,
    ...pageTypeHistoryCollections,
  ];
};
