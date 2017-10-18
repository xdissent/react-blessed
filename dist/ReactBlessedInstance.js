'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _ReactReconciler = require('react-dom/lib/ReactReconciler');

var _ReactReconciler2 = _interopRequireDefault(_ReactReconciler);

var _ReactUpdates = require('react-dom/lib/ReactUpdates');

var _ReactUpdates2 = _interopRequireDefault(_ReactUpdates);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _ReactBlessedTopLevelWrapper = require('./ReactBlessedTopLevelWrapper');

var _ReactBlessedTopLevelWrapper2 = _interopRequireDefault(_ReactBlessedTopLevelWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReactBlessedInstance {

  constructor(component) {
    this._component = component;
  }

  update(nextElement) {
    const component = this._component;
    (0, _invariant2.default)(component, 'Cannot update after unmount');
    const nextWrappedElement = (0, _react.createElement)(_ReactBlessedTopLevelWrapper2.default, {
      child: nextElement
    });
    _ReactUpdates2.default.batchedUpdates(() => {
      const transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {
        _ReactReconciler2.default.receiveComponent(component, nextWrappedElement, transaction, {});
      });
      _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);
    });
  }

  unmount() {
    const component = this._component;
    if (!component) return;
    _ReactUpdates2.default.batchedUpdates(() => {
      const transaction = _ReactUpdates2.default.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {
        _ReactReconciler2.default.unmountComponent(component, false);
      });
      _ReactUpdates2.default.ReactReconcileTransaction.release(transaction);
    });
    this._component = null;
  }

  getNode() {
    const component = this._component;
    (0, _invariant2.default)(component, 'Cannot get node after unmount');
    return component._renderedComponent.getPublicInstance();
  }

  getScreen() {
    const component = this._component;
    (0, _invariant2.default)(component, 'Cannot get screen after unmount');
    const { screen } = component._renderedComponent._hostContainerInfo || {};
    (0, _invariant2.default)(screen, 'Could not find blessed screen');
    return screen;
  }

  render() {
    const component = this._component;
    (0, _invariant2.default)(component, 'Cannot render after unmount');
    const { render } = component._renderedComponent._hostContainerInfo || {};
    (0, _invariant2.default)(render, 'Could not find blessed render');
    render();
  }
}
exports.default = ReactBlessedInstance;