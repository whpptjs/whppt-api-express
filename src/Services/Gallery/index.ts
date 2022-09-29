import { FetchImage } from './FetchImage';
import { FetchOriginal } from './FetchOriginal';
import { UploadGalleryItem, Upload } from './Upload';
import { IdService } from '../Id';
import { StorageService } from '../Storage';
import { WhpptDatabase } from '../Database';

export type GalleryService = {
  upload: UploadGalleryItem;
  fetchOriginal: FetchOriginal;
  fetchImage: FetchImage;
};
export type GalleryConstructor = (
  $id: IdService,
  $database: Promise<WhpptDatabase>,
  $storage: StorageService
) => GalleryService;

export const Gallery: GalleryConstructor = ($id, $database, $storage) => {
  const fetchOriginal = FetchOriginal($database, $storage);
  return {
    upload: Upload($id, $database, $storage),
    fetchOriginal,
    fetchImage: FetchImage($database, $storage, fetchOriginal),
  };
};
