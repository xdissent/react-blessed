'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const ReactBlessedTopLevelWrapper = function () {};
ReactBlessedTopLevelWrapper.prototype.isReactComponent = {};
ReactBlessedTopLevelWrapper.displayName = 'ReactBlessedTopLevelWrapper';
ReactBlessedTopLevelWrapper.prototype.render = function () {
  return this.props.child;
};
ReactBlessedTopLevelWrapper.isReactTopLevelWrapper = true;

exports.default = ReactBlessedTopLevelWrapper;