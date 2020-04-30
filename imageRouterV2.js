const router = require('express').Router();
const Context = require('./context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;
// const formidableMiddleware = require('express-formidable');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

module.exports = () => {
  return Context().then(context => {
    const { $imageV2 } = context;

    // router.get('/img2/:imageId', cache({ ttl: sixMonths }), (req, res) => {
    //   return $image
    //     .fetchOriginal({ id: req.params.imageId })
    //     .then(response => {
    //       if (!response) return res.status(500).send('Image not found');
    //       res.type(response.ContentType).send(response.Body);
    //     })
    //     .catch(err => {
    //       res.status(500).send(err);
    //     });
    // });

    router.get('/img2/:imageId', cache({ ttl: sixMonths }), (req, res) => {
      const accept = req.headers['accept'];

      return $imageV2
        .fetch({ id: req.params.imageId, format: req.query, accept })
        .then(response => {
          if (!response) return res.status(500).send('Image not found');
          res.type(response.ContentType).send(response.Body);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    });

    router.post('/img2/upload', upload, (req, res) => {
      const file = req.file;
      if (!file) return { message: 'Image file not found' };

      $imageV2
        .upload(file)
        .then(() => {
          return res.sendStatus(200);
        })
        .catch(err => {
          res.status(err.http_code || 500).send(err);
        });
    });

    return router;
  });
};
