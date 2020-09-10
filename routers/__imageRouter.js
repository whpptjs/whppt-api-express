const router = require('express').Router();
const Context = require('../context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;
// const formidableMiddleware = require('express-formidable');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

module.exports = context => {
  const { $image } = context;

  router.get('/img/:imageId', cache({ ttl: sixMonths }), (req, res) => {
    return $image
      .fetchOriginal({ id: req.params.imageId })
      .then(response => {
        if (!response) return res.status(500).send('Image not found');
        res.type(response.ContentType).send(response.Body);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.get('/img/:format/:imageId', cache({ ttl: sixMonths }), (req, res) => {
    const accept = req.headers['accept'];

    return $image
      .fetch({ id: req.params.imageId, format: req.params.format, accept })
      .then(response => {
        if (!response) return res.status(500).send('Image not found');
        res.type(response.ContentType).send(response.Body);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });

  router.post('/img/upload', upload, (req, res) => {
    const file = req.file;
    if (!file) return { message: 'Image file not found' };

    $image
      .upload(file)
      .then(() => {
        return res.sendStatus(200);
      })
      .catch(err => {
        res.status(err.http_code || 500).send(err);
      });
  });

  return router;
};
