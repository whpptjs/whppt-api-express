const router = require('express').Router();
const Context = require('./context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;

module.exports = () => {
  return Context().then(context => {
    const { $image } = context;

    router.get('/img/:imageId', cache({ ttl: oneDay }), (req, res) => {
      return $image
        .fetchOriginal({ id: req.params.imageId })
        .then(response => {
          // console.log("TCL: response", response);
          if (!response) return res.status(500).send('Image not found');
          res.type(response.ContentType).send(response.Body);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    });

    router.get('/img/:format/:imageId', cache({ ttl: oneDay }), (req, res) => {
      return $image
        .fetch({ id: req.params.imageId, format: req.params.format })
        .then(response => {
          // console.log("TCL: response", response);
          if (!response) return res.status(500).send('Image not found');
          res.type(response.ContentType).send(response.Body);
        })
        .catch(err => {
          res.status(500).send(err);
        });
    });

    router.post('/img/upload', (req, res) => {
      const file = req.files.file;
      console.log('TCL: file', file);
      if (!file) return { message: 'Image file not found' };

      return (
        $image
          .upload(file)
          // .then(() => {})
          .catch(err => {
            res.status(err.http_code || 500).send(err);
          })
      );
    });

    return router;
  });
};
