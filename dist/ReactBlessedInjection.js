'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = inject;

var _ReactInjection = require('react-dom/lib/ReactInjection');

var _ReactInjection2 = _interopRequireDefault(_ReactInjection);

var _ReactDefaultBatchingStrategy = require('react-dom/lib/ReactDefaultBatchingStrategy');

var _ReactDefaultBatchingStrategy2 = _interopRequireDefault(_ReactDefaultBatchingStrategy);

var _ReactBlessedReconcileTransaction = require('./ReactBlessedReconcileTransaction');

var _ReactBlessedReconcileTransaction2 = _interopRequireDefault(_ReactBlessedReconcileTransaction);

var _ReactBlessedComponent = require('./ReactBlessedComponent');

var _ReactBlessedComponent2 = _interopRequireDefault(_ReactBlessedComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let injected = false;

function inject() {
  if (injected) return;
  injected = true;

  _ReactInjection2.default.Updates.injectReconcileTransaction(_ReactBlessedReconcileTransaction2.default);

  _ReactInjection2.default.Updates.injectBatchingStrategy(_ReactDefaultBatchingStrategy2.default);

  _ReactInjection2.default.HostComponent.injectGenericComponentClass(_ReactBlessedComponent2.default);

  _ReactInjection2.default.Component.injectEnvironment({
    processChildrenUpdates: () => {},
    replaceNodeWithMarkup: () => {}
  });
}