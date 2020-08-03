const router = require('express').Router();
const Context = require('./context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;
const sixMonths = oneDay * 30 * 6;

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

module.exports = context => {
  const {
    $file,
    $mongo: { $db },
  } = context;

  router.post('/file/uploadFile', upload, (req, res) => {
    const file = req.file;
    const description = req.body.description;
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

  router.get('/file/getFile/:fileId', cache({ ttl: sixMonths }), (req, res) => {
    const { fileId } = req.params;

    return $db
      .collection('files')
      .findOne({ _id: fileId })
      .then(file => {
        res.redirect(`/file/getFile/${fileId}/${file.name}`);
      });
  });

  router.get('/file/:id/:name?', cache({ ttl: sixMonths }), (req, res) => {
    const id = req.params.id && req.params.id.endsWith('/') ? removeTrailingSlash(req.params.id) : req.params.id;

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

  router.get('/file/getFile/:id/:name?', cache({ ttl: sixMonths }), (req, res) => {
    const id = req.params.id && req.params.id.endsWith('/') ? removeTrailingSlash(req.params.id) : req.params.id;

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

  return router;
};

function removeTrailingSlash(string) {
  return string.replace(/\/$/, '');
}
