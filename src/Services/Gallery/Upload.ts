import fileType from 'file-type';
import { MongoService } from '../Mongo';
import { GalleryItem, GalleryItemType } from './GalleryItem';
import { IdService } from '../Id/index';
import { StorageService } from '../Storage';

export type UploadGaleryItemArgs = { file: any; domainId: string; type: GalleryItemType };
export type UploadGalleryItem = (args: UploadGaleryItemArgs) => Promise<GalleryItem>;
export type UploadGalleryItemContstructor = (
  $id: IdService,
  $mongo: Promise<MongoService>,
  $storage: StorageService
) => UploadGalleryItem;

export const Upload: UploadGalleryItemContstructor = ($id, $mongo, $storage) => {
  return ({ file, domainId, type }) => {
    const { buffer, mimetype, originalname } = file;
    return fileType.fromBuffer(buffer).then(fileType => {
      const newGalleryItem: GalleryItem = {
        _id: $id.newId(),
        domainId,
        type,
        fileInfo: {
          originalname,
          ext: fileType?.ext,
          mime: fileType?.mime,
          type: mimetype,
        },
        tags: [],
        suggestedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        date: new Date(),
      };

      return $mongo.then(({ $startTransaction, $save }) => {
        return $startTransaction(session => {
          return $save('gallery', newGalleryItem, { session }).then(() =>
            $storage.upload(buffer, newGalleryItem._id)
          );
        }).then(() => newGalleryItem);
      });
    });
  };
};
