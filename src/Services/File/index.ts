import fileType from 'file-type';
import { WhpptConfig } from '../Config';
import { IdService } from '../Id';
import { MongoService } from '../Mongo';
import { StorageService } from '../Storage';

export type FileService = {
  upload: (file: any, description: any) => Promise<void>;
  remove: (fileId: string) => Promise<void>;
  fetchOriginal: ({ id }: { id: string }) => Promise<any>;
};
export type FileServiceConstructor = (
  $id: IdService,
  $mongo: Promise<MongoService>,
  $storage: StorageService,
  config: WhpptConfig
) => FileService;

/**
 * @deprecated use gallery
 */
export const File: FileServiceConstructor = ($id, $mongo, $storage, config) => {
  const upload = function (file: any, description: any) {
    return $mongo.then(({ $db, $dbPub }) => {
      const { buffer, mimetype: type, originalname: name } = file;
      const id = $id.newId();

      return fileType.fromBuffer(buffer).then(fType => {
        return $storage.uploadDoc(buffer, id, {}).then(() => {
          return $db
            .collection('files')
            .insertOne({
              _id: id as any,
              uploadedOn: new Date(),
              name,
              type,
              fileType: fType,
              description: description || '',
            })
            .then(() => {
              if (config.disablePublishing) return Promise.resolve();
              return $dbPub
                .collection('files')
                .insertOne({
                  _id: id as any,
                  uploadedOn: new Date(),
                  name,
                  type,
                  fileType: fType,
                  description: description || '',
                })
                .then(() => {});
            });
        });
      });
    });
  };

  const remove = function (fileId: string) {
    return $mongo.then(({ $delete, $unpublish }) => {
      return $unpublish('files', fileId).then(() => {
        return $delete('files', fileId).then(() => {
          return $storage.removeDoc(fileId);
        });
      });
    });
  };

  const fetchOriginal = function ({ id }: { id: string }) {
    return $mongo.then(({ $db }) => {
      return $db
        .collection('files')
        .findOne({ _id: id })
        .then((storedImage: any) => {
          return $storage.fetchDoc(id).then(({ imageBuffer }: { imageBuffer: any }) => {
            const response = imageBuffer;
            response.Body = imageBuffer;
            response.ContentType = storedImage.type;
            return response;
          });
        });
    });
  };

  return { upload, remove, fetchOriginal };
};
