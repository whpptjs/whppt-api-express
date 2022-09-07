import { ContextType } from '../Context';
import { GalleryItem } from './GalleryItem';

export type FetchOriginalArgs = { itemId: string; type: string };
export type FetchOriginal = ({ itemId, type }: FetchOriginalArgs) => Promise<any>;
export type FetchOriginalConstructor = ({ $aws, $mongo: { $db } }: ContextType) => FetchOriginal;

export const FetchOriginal: FetchOriginalConstructor =
  ({ $aws, $mongo: { $db } }) =>
  ({ itemId, type }) => {
    return $db
      .collection('gallery')
      .findOne<GalleryItem>({ _id: itemId })
      .then(storedItem => {
        return $aws.fetchContentFromS3(itemId, type).then(({ fileBuffer }: { fileBuffer: any }) => {
          const response = fileBuffer;
          response.Body = fileBuffer;
          response.ContentType = storedItem?.fileInfo?.type;
          return response;
        });
      });
  };
