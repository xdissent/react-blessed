'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CallbackQueue = require('react-dom/lib/CallbackQueue');

var _CallbackQueue2 = _interopRequireDefault(_CallbackQueue);

var _PooledClass = require('react/lib/PooledClass');

var _PooledClass2 = _interopRequireDefault(_PooledClass);

var _Transaction = require('react-dom/lib/Transaction');

var _Transaction2 = _interopRequireDefault(_Transaction);

var _ReactUpdateQueue = require('react-dom/lib/ReactUpdateQueue');

var _ReactUpdateQueue2 = _interopRequireDefault(_ReactUpdateQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ON_BLESSED_READY_QUEUEING = {
  initialize() {
    this.reactMountReady.reset();
  },
  close() {
    this.reactMountReady.notifyAll();
  }
};

const TRANSACTION_WRAPPERS = [ON_BLESSED_READY_QUEUEING];

function ReactBlessedReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = _CallbackQueue2.default.getPooled(this);
}

const Mixin = {
  getTransactionWrappers() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady() {
    return this.reactMountReady;
  },
  getUpdateQueue() {
    return _ReactUpdateQueue2.default;
  },
  checkpoint() {
    return this.reactMountReady.checkpoint();
  },
  rollback(checkpoint) {
    this.reactMountReady.rollback(checkpoint);
  },
  destructor() {
    _CallbackQueue2.default.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

Object.assign(ReactBlessedReconcileTransaction.prototype, _Transaction2.default, ReactBlessedReconcileTransaction, Mixin);

_PooledClass2.default.addPoolingTo(ReactBlessedReconcileTransaction);

exports.default = ReactBlessedReconcileTransaction;