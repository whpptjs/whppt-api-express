import { WhpptDatabase } from '../Database';
import { StorageService } from '../Storage';
import { GalleryItem } from './GalleryItem';

export type FetchOriginalArgs = { itemId: string; type: string };
export type FetchOriginal = (args: FetchOriginalArgs) => Promise<any>;
export type FetchOriginalConstructor = (
  $database: Promise<WhpptDatabase>,
  $storage: StorageService
) => FetchOriginal;

export const FetchOriginal: FetchOriginalConstructor =
  ($database, $storage) =>
  ({ itemId, type }) => {
    return $database.then(({ document }) => {
      return document.fetch<GalleryItem>('gallery', itemId).then(storedItem => {
        return $storage.fetch(itemId, type).then((fileBuffer: any) => {
          const response = fileBuffer;
          response.Body = fileBuffer;
          response.ContentType = storedItem?.fileInfo?.type;
          return response;
        });
      });
    });
  };
