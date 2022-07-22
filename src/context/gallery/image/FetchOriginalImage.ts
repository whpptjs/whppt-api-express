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
      return $aws.fetchDocFromS3(itemId).then(({ imageBuffer }: { imageBuffer: any }) => {
        const response = imageBuffer;
        response.Body = imageBuffer;
        response.ContentType = storedItem?.fileInfo?.type;
        return response;
      });
    });
};
