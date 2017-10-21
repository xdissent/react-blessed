'use strict';
try {
  module.exports = require('./src/render.js');
} catch (err) {
  module.exports = require('./dist/render.js');
}
