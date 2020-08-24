const router = require('express').Router();
const cache = require('express-cache-headers');
const multer = require('multer');

const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

module.exports = context => {
  const { $image } = context;

  router.get('/img/:imageId', cache({ ttl: sixMonths }), (req, res) => {
    const accept = req.headers['accept'];

    return $image
      .fetch({ id: req.params.imageId, format: req.query, accept })
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
      .then(image => res.json(image))
      .catch(err => {
        res.status(err.http_code || 500).send(err);
      });
  });

  return router;
};
