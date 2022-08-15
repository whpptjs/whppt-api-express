import { ContextType } from '../Context';
import { GalleryItem } from './GalleryItem';

export type FetchOriginalArgs = { itemId: string };
export type FetchOriginal = ({ itemId }: FetchOriginalArgs) => Promise<any>;
export type FetchOriginalConstructor = ({ $aws, $mongo: { $db } }: ContextType) => FetchOriginal;

export const FetchOriginal: FetchOriginalConstructor =
  ({ $aws, $mongo: { $db } }) =>
  ({ itemId }) => {
    return $db
      .collection('gallery')
      .findOne<GalleryItem>({ _id: itemId })
      .then(storedItem => {
        return $aws.fetchFromS3(itemId).then(({ fileBuffer }: { fileBuffer: any }) => {
          const response = fileBuffer;
          response.Body = fileBuffer;
          response.ContentType = storedItem?.fileInfo?.type;
          return response;
        });
      });
  };
