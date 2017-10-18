'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = solveClass;

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function solveClass(props) {
  let { class: classes } = props,
      rest = _objectWithoutProperties(props, ['class']);
  classes = classes == null || typeof classes !== 'object' ? [] : Array.isArray(classes) ? classes.filter(c => c) : [classes];
  return (0, _lodash2.default)({}, ...classes, rest);
}