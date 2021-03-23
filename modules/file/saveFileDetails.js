const assert = require('assert');

module.exports = {
  exec({ $mongo: { $save } }, file) {
    assert(file, 'File not found.');

    return $save('files', file);
  },
};
