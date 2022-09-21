import { FetchImage } from './FetchImage';
import { FetchOriginal } from './FetchOriginal';
import { UploadGalleryItem, Upload } from './Upload';
import { IdService } from '../Id';
import { MongoService } from '../Mongo';
import { StorageService } from '../Storage';

export type GalleryService = {
  upload: UploadGalleryItem;
  fetchOriginal: FetchOriginal;
  fetchImage: FetchImage;
};
export type GalleryConstructor = (
  $id: IdService,
  $mongo: Promise<MongoService>,
  $storage: StorageService
) => GalleryService;

export const Gallery: GalleryConstructor = ($id, $mongo, $storage) => {
  const fetchOriginal = FetchOriginal($mongo, $storage);
  return {
    upload: Upload($id, $mongo, $storage),
    fetchOriginal,
    fetchImage: FetchImage($mongo, $storage, fetchOriginal),
  };
};
