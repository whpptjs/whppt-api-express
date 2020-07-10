const assert = require('assert');

module.exports = {
  exec({ $mongo: { $db, $save } }, file) {
    assert(file, 'File not found.');

    return $save('files', file).then(() => file);
  },
};
