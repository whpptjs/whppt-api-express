const express = require('express');
const consola = require('consola');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const Whppt = require('../index');
const Image = require('../imageRouter');

// const context = require('./context');
// const seo = require('./api/seo');
// const apiSecurity = require('./api/security');
// const api = require('./api/api');
// const redirects = require('./api/redirects');
// const forms = require('./api/forms');
// const apiImageUpload = require('./api/image/upload');
// const apiImageGetImage = require('./api/image/getImage');

const [host, port] = ['localhost', '3001'];

Promise.all([Image(), Whppt()]).then(([imageRouter, whppt]) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(whppt);

  app.use(imageRouter);

  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json(err);
  });

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
});

// Whppt().then(whppt => {
//   app.use(cors());
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: false }));

//   app.use(whppt);

//   app.use('/', imageRouter);

//   app.use((req, res, next) => {
//     const err = new Error('Not Found');
//     err.status = 404;
//     next(err);
//   });

//   app.use((err, req, res) => {
//     res.status(err.status || 500);
//     res.json(err);
//   });

//   app.listen(port, host);
//   consola.ready({
//     message: `Server listening on http://${host}:${port}`,
//     badge: true,
//   });
// });
