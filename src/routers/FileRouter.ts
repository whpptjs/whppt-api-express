import assert from 'assert';
import { Router } from 'express';
import { LoggerService } from 'src/Services';
import { WhpptRequest } from '..';

const cache = require('express-cache-headers');
const multer = require('multer');

const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

export type FileRouterConstructor = ($logger: LoggerService) => Router;

export const FileRouter: FileRouterConstructor = $logger => {
  const router = Router();

  router.post('/file/uploadFile', upload, (req: any, res: any) => {
    const { file } = req as any;
    const { description } = req.body;
    if (!file) return { message: 'File not found' };

    return (req as WhpptRequest).moduleContext
      .then(({ $file }) => {
        assert($file, 'File service has not been configured');
        return $file.upload(file, description).then(() => {
          return res.sendStatus(200);
        });
      })
      .catch(err => {
        $logger.error(err);

        res.status(err.http_code || 500).send(err.message || err);
      });
  });

  router.post('/file/removeFile', (req: any, res: any) => {
    const fileId = req.body._id;

    return (req as WhpptRequest).moduleContext
      .then(({ $file }) => {
        assert($file, 'File service has not been configured');
        return $file.remove(fileId).then(() => {
          return res.sendStatus(200);
        });
      })
      .catch(err => {
        $logger.error(err);

        res.status(err.http_code || 500).send(err.message || err);
      });
  });

  //backwards compatibility only - Stopped using on the 4/8/20
  router.get('/file/getFile/:fileId', cache({ ttl: sixMonths }), (req: any, res: any) => {
    return (req as WhpptRequest).moduleContext
      .then(({ $database }) => {
        return $database.then(({ document }) => {
          const { fileId } = req.params;

          return document.fetch('files', fileId).then((file: any) => {
            res.redirect(`/file/${fileId}/${file.name}`);
          });
        });
      })
      .catch(err => {
        $logger.error(err);

        res.status(err.http_code || 500).send(err.message || err);
      });
  });

  router.get('/file/:id/:name', cache({ ttl: sixMonths }), (req: any, res: any) => {
    const { id } = req.params;

    return (req as WhpptRequest).moduleContext
      .then(({ $file }) => {
        assert($file, 'File service has not been configured');
        return $file.fetchOriginal({ id }).then(fileBuffer => {
          if (!fileBuffer) return res.status(500).send('File not found');

          return res.type(fileBuffer.ContentType).send(fileBuffer.Body);
        });
      })
      .catch(err => {
        $logger.error(err);

        res.status(500).send(err.message || err);
      });
  });

  router.get('/file/:id', (req: any, res: any) => {
    return (req as WhpptRequest).moduleContext
      .then(({ $database }) => {
        return $database.then(({ document }) => {
          const { id } = req.params;

          return document.fetch('files', id).then((file: any) => {
            res.redirect(`/file/${id}/${file.name}`);
          });
        });
      })
      .catch(err => {
        $logger.error(err);

        res.status(err.http_code || 500).send(err.message || err);
      });
  });

  return router;
};
