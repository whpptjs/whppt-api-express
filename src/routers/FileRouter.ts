import { Router } from 'express';
import { MongoService, FileService } from '../Services';
const cache = require('express-cache-headers');
const multer = require('multer');

const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

export type FileRouterConstructor = (
  $gallery: FileService,
  $mongo: Promise<MongoService>
) => Router;

export const FileRouter: FileRouterConstructor = ($file, $mongo) => {
  const router = Router();

  router.post('/file/uploadFile', upload, (req, res) => {
    const { file } = req as any;
    const { description } = req.body;
    if (!file) return { message: 'File not found' };

    return $file
      .upload(file, description)
      .then(() => {
        return res.sendStatus(200);
      })
      .catch(err => {
        res.status(err.http_code || 500).send(err);
      });
  });

  router.post('/file/removeFile', (req, res) => {
    const fileId = req.body._id;

    return $file
      .remove(fileId)
      .then(() => {
        return res.sendStatus(200);
      })
      .catch(err => {
        res.status(err.http_code || 500).send(err);
      });
  });

  //backwards compatibility only - Stopped using on the 4/8/20
  router.get('/file/getFile/:fileId', cache({ ttl: sixMonths }), (req, res) => {
    return $mongo.then(({ $db }) => {
      const { fileId } = req.params;

      return $db
        .collection('files')
        .findOne({ _id: fileId })
        .then((file: any) => {
          res.redirect(`/file/${fileId}/${file.name}`);
        });
    });
  });

  router.get('/file/:id/:name', cache({ ttl: sixMonths }), (req, res) => {
    const { id } = req.params;
    return $file
      .fetchOriginal({ id })
      .then(fileBuffer => {
        if (!fileBuffer) return res.status(500).send('File not found');

        return res.type(fileBuffer.ContentType).send(fileBuffer.Body);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get('/file/:id', (req, res) => {
    return $mongo.then(({ $db }) => {
      const { id } = req.params;

      return $db
        .collection('files')
        .findOne({ _id: id })
        .then((file: any) => {
          res.redirect(`/file/${id}/${file.name}`);
        });
    });
  });

  return router;
};
