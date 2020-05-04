require('dotenv').config();

const express = require('express');
const consola = require('consola');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const Whppt = require('../index');
const [host, port] = ['localhost', '3001'];
const security = require('./security');

Promise.all([
  Whppt({
    security,
  }),
]).then(([whppt]) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(whppt);

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
