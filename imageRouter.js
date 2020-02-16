const expressRouter = require('express').Router();
const Context = require('./context');

const cache = require('express-cache-headers');
const oneDay = 60 * 60 * 24;

module.exports = () => {
  return Context().then(context => {
    const { $image } = context;

    expressRouter.get('/img/:format/:imageId', cache({ ttl: oneDay }), (req, res) => {
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
  });
};
