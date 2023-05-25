import { Router, Response, Request } from 'express';
import { parseImageFormat } from '../Services/Gallery/FetchImage';
import { GalleryItem } from '../Services/Gallery/GalleryItem';
import { WhpptRequest } from '..';
import { LoggerService } from '../Services';

const cache = require('express-cache-headers');
const multer = require('multer');

const router = Router();

const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

export type GalleryRouterConstructor = (
  $logger: LoggerService,
  apiPrefix: string
) => Router;

export const GalleryRouter: GalleryRouterConstructor = ($logger, apiPrefix) => {
  router.post(`/${apiPrefix}/gallery/upload`, upload, (req: any, res: Response) => {
    console.log('🚀 gallery/upload Starting');
    const { file } = req;
    const { domainId, type } = req.body;

    if (!file) return res.status(404).json({ message: 'File not found' });
    console.log('🚀 gallery/upload got file');

    return (req as WhpptRequest).moduleContext.then(({ $gallery }) => {
      console.log('🚀 gallery/upload built context');

      if (!$gallery) throw new Error('Gallery is required');
      console.log('🚀 gallery/upload context gallery check');
      return $gallery
        .upload({ file, domainId, type })
        .then(galleryItem => {
          console.log('🚀 gallery/upload gallery upload done');
          return res.json(galleryItem);
        })
        .catch(err => {
          console.log('🚀 ~ file: GalleryRouter.ts:38 ~ return ~ err:', err);
          $logger.error(err);
          res.status(err.http_code || 500).send(err);
        });
    });
  });

  router.get(
    `/${apiPrefix}/gallery-file/image/:imageId`,
    cache({ ttl: sixMonths }),
    (req: Request, res: Response) => {
      return (req as WhpptRequest).moduleContext
        .then(({ $gallery }) => {
          if (!$gallery) throw new Error('Gallery is required');
          const { accept } = req.headers;
          const format = parseImageFormat(req.query);
          return $gallery
            .fetchImage({ itemId: req.params.imageId, format, accept })
            .then((response: any) => {
              if (!response) return res.status(404).send('Image not found');

              res.type(response.ContentType).send(response.Body);
            });
        })
        .catch((err: any) => {
          $logger.error(err);
          res.status(500).send(err);
        });
    }
  );

  router.get(
    `/${apiPrefix}/gallery-file/svg/:svgId`,
    cache({ ttl: sixMonths }),
    (req: Request, res: Response) => {
      return (req as WhpptRequest).moduleContext
        .then(({ $gallery }) => {
          if (!$gallery) throw new Error('Gallery is required');
          return $gallery
            .fetchOriginal({ itemId: req.params.svgId, type: 'svg' })
            .then((response: any) => {
              if (!response) return res.status(404).send('Image not found');

              res.type(response.ContentType).send(response.Body);
            });
        })
        .catch((err: any) => {
          $logger.error(err);
          res.status(500).send(err);
        });
    }
  );

  router.get(
    `/${apiPrefix}/gallery-file/video/:videoId`,
    cache({ ttl: sixMonths }),
    (req: Request, res: Response) => {
      return (req as WhpptRequest).moduleContext
        .then(({ $gallery }) => {
          if (!$gallery) throw new Error('Gallery is required');
          return $gallery
            .fetchOriginal({ itemId: req.params.videoId, type: 'video' })
            .then((response: any) => {
              if (!response) return res.status(404).send('Video not found');

              res.type(response.ContentType).send(response.Body);
            });
        })
        .catch((err: any) => {
          $logger.error(err);
          res.status(500).send(err);
        });
    }
  );

  router.get(
    `/${apiPrefix}/gallery-file/doc/:id/:name`,
    cache({ ttl: sixMonths }),
    (req: Request, res: Response) => {
      const { id } = req.params;

      return (req as WhpptRequest).moduleContext
        .then(({ $gallery }) => {
          if (!$gallery) throw new Error('Gallery is required');
          return $gallery
            .fetchOriginal({ itemId: id, type: 'doc' })
            .then((fileBuffer: any) => {
              if (!fileBuffer) return res.status(500).send('File not found');

              return res.type(fileBuffer.ContentType).send(fileBuffer.Body);
            });
        })
        .catch((err: any) => {
          $logger.error(err);
          res.status(500).send(err);
        });
    }
  );

  router.get(`/${apiPrefix}/gallery-file/file/:id`, (req: Request, res: Response) => {
    const { id } = req.params;

    return (req as WhpptRequest).moduleContext
      .then(({ $database }) => {
        if (!$database) throw new Error('Database connection is required');
        return $database.then(db => {
          return db.document.fetch<GalleryItem>('gallery', id).then(item => {
            res.redirect(
              `/${apiPrefix}/gallery-file/doc/${id}/${item?.fileInfo?.originalname}`
            );
          });
        });
      })
      .catch((err: any) => {
        $logger.error(err);
        res.status(500).send(err);
      });
  });

  return router;
};

// const trackEvent = (medium: string, campaign: string, fileName: string) => {
//   const trackingId = process.env.GA_TRACKING_ID;
//   if (!trackingId || !trackingId.length) return Promise.resolve();
//   if (!medium || !campaign || !fileName) return Promise.resolve();
//   const data = {
//     v: '1',
//     tid: trackingId,
//     cm: medium,
//     cc: fileName,
//     cn: campaign,
//   };

//   return fetch('http://www.google-analytics.com/debug/collect', {
//     params: data,
//   });
// };
