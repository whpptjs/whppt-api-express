import assert from 'assert';
import { HttpModule } from '../HttpModule';
import { GalleryItem, GalleryItemType } from '../../context/gallery/GalleryItem';

export type SearchParams = {
  domainId: string;
  type: GalleryItemType;
  page?: number;
  size?: number;
  queryTags?: string[];
  filterTag?: string;
};

const search: HttpModule<SearchParams, { items: GalleryItem[] }> = {
  authorise({ $roles }, { user }) {
    // TODO: Gallery Security
    const requiredRoles = [] as string[];
    return $roles.validate(user, [requiredRoles]);
  },
  exec({ $mongo: { $db } }, { domainId, page, size, type, filterTag, queryTags }) {
    assert(domainId, 'Please provide a domainId');

    page = page || 1;
    size = size || 30;
    queryTags = queryTags || [];

    const query = {
      domainId,
      type,
    } as any;

    const filterQuery = { $elemMatch: { $eq: filterTag } };
    const searchQuery = { $in: queryTags };

    if (filterTag && !queryTags.length) query.tags = filterQuery;
    if (queryTags.length && !filterTag) query.tags = searchQuery;
    if (filterTag && queryTags.length) query.tags = { $and: [filterQuery, searchQuery] };

    return $db
      .collection('gallery')
      .find<GalleryItem>(query, { projection: { originalFilename: 1 } })
      .skip(size * (page - 1))
      .limit(size)
      .toArray()
      .then(items => ({ items }));
  },
};

export default search;
