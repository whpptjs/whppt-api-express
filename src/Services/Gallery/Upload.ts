import assert from 'assert';
import fileType from 'file-type';
import { GalleryItem } from './GalleryItem';
import { IdService } from '../Id/index';
import { StorageService } from '../Storage';
import { WhpptDatabase } from '../Database';

export type UploadGaleryItemArgs = { file: any; domainId: string; type: string };
export type UploadGalleryItem = (args: UploadGaleryItemArgs) => Promise<GalleryItem>;
export type UploadGalleryItemContstructor = (
  $id: IdService,
  $database: Promise<WhpptDatabase>,
  $storage: StorageService
) => UploadGalleryItem;

export const Upload: UploadGalleryItemContstructor = ($id, $database, $storage) => {
  return ({ file, domainId, type }) => {
    return Promise.resolve().then(() => {
      assert(file, 'File to upload is required');
      assert(domainId, 'Domain Id is required');
      assert(type, 'File type is required');

      const { buffer, mimetype, originalname } = file;
      console.log('🚀 GALLERY ~ fileType from BUFFER STARTING');
      return fileType.fromBuffer(buffer).then(fileType => {
        console.log('🚀 GALLERY ~ fileType from BUFFER FINISHED');

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

        return $database.then(({ startTransaction, document }) => {
          return startTransaction(session => {
            return Promise.all([
              document.save('gallery', newGalleryItem, { session }),
              document.publish('gallery', newGalleryItem, { session }),
            ]).then(() => $storage.upload(buffer, newGalleryItem._id, type, {}));
          }).then(() => newGalleryItem);
        });
      });
    });
  };
};
