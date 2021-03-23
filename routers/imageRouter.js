const router = require('express').Router();
const cache = require('express-cache-headers');
const multer = require('multer');
const { parse } = require('uri-js');

const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

const imagePath = process.env.BASE_IMAGE_URL ? parse(process.env.BASE_IMAGE_URL).path : '/img';

module.exports = context => {
  const { $image } = context;

  router.get(`${imagePath}/:imageId`, cache({ ttl: sixMonths }), (req, res) => {
    const accept = req.headers['accept'];

    return $image
      .fetch({ id: req.params.imageId, format: req.query, accept })
      .then(response => {
        if (!response) return res.status(404).send('Image not found');

        res.type(response.ContentType).send(response.Body);
      })
      .catch(err => res.status(404).send(err));
  });

  router.post(`${imagePath}/upload`, upload, (req, res) => {
    const file = req.file;
    if (!file) return { message: 'Image file not found' };

    $image
      .upload(file)
      .then(image => res.json(image))
      .catch(err => {
        res.status(err.http_code || 500).send(err);
      });
  });

  return router;
};
