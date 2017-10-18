'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = undefined;

var _react = require('react');

var _ReactReconciler = require('react-dom/lib/ReactReconciler');

var _ReactReconciler2 = _interopRequireDefault(_ReactReconciler);

var _ReactUpdates = require('react-dom/lib/ReactUpdates');

var _ReactUpdates2 = _interopRequireDefault(_ReactUpdates);

var _instantiateReactComponent = require('react-dom/lib/instantiateReactComponent');

var _instantiateReactComponent2 = _interopRequireDefault(_instantiateReactComponent);

var _ReactBlessedInjection = require('./ReactBlessedInjection');

var _ReactBlessedInjection2 = _interopRequireDefault(_ReactBlessedInjection);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _ReactBlessedTopLevelWrapper = require('./ReactBlessedTopLevelWrapper');

var _ReactBlessedTopLevelWrapper2 = _interopRequireDefault(_ReactBlessedTopLevelWrapper);

var _ReactBlessedInstance = require('./ReactBlessedInstance');

var _ReactBlessedInstance2 = _interopRequireDefault(_ReactBlessedInstance);

var _ReactBlessedScreen = require('./ReactBlessedScreen');

var _ReactBlessedScreen2 = _interopRequireDefault(_ReactBlessedScreen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mountComponentIntoNode(instance, transaction, hostParent, hostContainerInfo) {
  const image = _ReactReconciler2.default.mountComponent(instance, transaction, hostParent, hostContainerInfo, {});
  instance._renderedComponent._topLevelWrapper = instance;
  return image;
}

function batchedMountComponentIntoNode(instance, hostContainerInfo) {
  const transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
  const image = transaction.perform(mountComponentIntoNode, null, instance, transaction, null, hostContainerInfo);
  _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);
  return image;
}

const render = exports.render = (element, screen) => {
  (0, _invariant2.default)(screen, 'Could not find blessed screen');
  (0, _ReactBlessedInjection2.default)();
  const wrapped = (0, _react.createElement)(_ReactBlessedTopLevelWrapper2.default, {
    child: element
  });
  const instance = (0, _instantiateReactComponent2.default)(wrapped, false);
  _ReactUpdates2.default.batchedUpdates(batchedMountComponentIntoNode, instance, new _ReactBlessedScreen2.default(screen));
  return new _ReactBlessedInstance2.default(instance);
};