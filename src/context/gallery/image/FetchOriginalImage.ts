import { ContextType } from '../../Context';
import { GalleryItem } from '../GalleryItem';

export type FetchOriginalImageArgs = { itemId: string };
export type FetchOriginalImage = ({ itemId }: FetchOriginalImageArgs) => Promise<any>;
export type FetchOriginalImageConstructor = ({ $aws, $mongo: { $db } }: ContextType) => FetchOriginalImage;

export const FetchOriginalImage: FetchOriginalImageConstructor = ({ $aws, $mongo: { $db } }) => ({ itemId }) => {
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
