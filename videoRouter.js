const router = require('express').Router();
const Context = require('./context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;
// const formidableMiddleware = require('express-formidable');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

module.exports = context => {
  const { $video } = context;

  router.get('/vid/:videoId', cache({ ttl: sixMonths }), (req, res) => {
    const accept = req.headers['accept'];

    return $video
      .fetch({ id: req.params.videoId, accept })
      .then(response => {
        if (!response) return res.status(500).send('Video not found');
        res.type(response.ContentType).send(response.Body);
      })
      .catch(err => {
        console.log('err', err);
        res.status(500).send(err);
      });
  });

  return router;
};
