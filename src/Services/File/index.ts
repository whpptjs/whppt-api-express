import assert from 'assert';
import fileType from 'file-type';
import { WhpptConfig } from '../Config';
import { WhpptDatabase } from '../Database';
import { IdService } from '../Id';
import { StorageService } from '../Storage';
import { WhpptMongoDatabase } from '../Database/Mongo/Database';

export type FileService = {
  upload: (file: any, description: any) => Promise<void>;
  remove: (fileId: string) => Promise<void>;
  fetchOriginal: ({ id }: { id: string }) => Promise<any>;
};
export type FileServiceConstructor = (
  $id: IdService,
  $database: Promise<WhpptDatabase>,
  $storage: StorageService,
  config: WhpptConfig
) => FileService;

/**
 * @deprecated use gallery
 */
export const File: FileServiceConstructor = ($id, $database, $storage, config) => {
  const upload = function (file: any, description: any) {
    return $database.then(database => {
      const { $db, $dbPub } = database as WhpptMongoDatabase;
      const { buffer, mimetype: type, originalname: name } = file;
      const id = $id.newId();

      assert($dbPub, 'Publishing database is not configured');

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
    return $database.then(({ $delete, $unpublish }) => {
      return $unpublish('files', fileId).then(() => {
        return $delete('files', fileId).then(() => {
          return $storage.removeDoc(fileId);
        });
      });
    });
  };

  const fetchOriginal = function ({ id }: { id: string }) {
    return $database.then(({ document }) => {
      return document.fetch('files', id).then((storedImage: any) => {
        return $storage.fetchDoc(id).then((docBuffer: any) => {
          const response = docBuffer;
          response.Body = docBuffer;
          response.ContentType = storedImage.type;
          return response;
        });
      });
    });
  };

  return { upload, remove, fetchOriginal };
};
