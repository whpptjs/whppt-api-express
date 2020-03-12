const $logger = require('../logger');
const Image = require('./index');
const fs = require('fs');

module.exports = (req, res) => {
  const collection = function() {
    return {
      findOne: function() {
        return { type: 'image/jpg' };
      },
    };
  };

  const imageBuffer = fs.readFileSync(__dirname + '/ROAD-Cover.jpg');
  const $mongo = { $db: { collection } };
  const $aws = { fetchImageFromS3: () => ({ imageBuffer }) };
  const image = Image({ $logger, $mongo, $aws });
  return image.fetch({ format: 'w_2000|h_1000|x_400|y_700|s_0.9|f_webp', id: '53ok6uakbla' }).then(response => {
    if (!response) return res.status(500).send('Image not found');
    // res.set('content-type', response.ContentType);
    res.type(response.ContentType).send(response.Body);
  });
};
