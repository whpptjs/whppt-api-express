import { MongoService } from '../Mongo';
import { StorageService } from '../Storage';
import { GalleryItem } from './GalleryItem';

export type FetchOriginalArgs = { itemId: string };
export type FetchOriginal = ({ itemId }: FetchOriginalArgs) => Promise<any>;
export type FetchOriginalConstructor = (
  $mongo: Promise<MongoService>,
  $storage: StorageService
) => FetchOriginal;

export const FetchOriginal: FetchOriginalConstructor =
  ($mongo, $storage) =>
  ({ itemId }) => {
    return $mongo.then(({ $db }) => {
      return $db
        .collection('gallery')
        .findOne<GalleryItem>({ _id: itemId })
        .then(storedItem => {
          return $storage.fetch(itemId).then(({ fileBuffer }: { fileBuffer: any }) => {
            const response = fileBuffer;
            response.Body = fileBuffer;
            response.ContentType = storedItem?.fileInfo?.type;
            return response;
          });
        });
    });
  };
