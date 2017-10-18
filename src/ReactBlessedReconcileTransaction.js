// @flow

import CallbackQueue from 'react-dom/lib/CallbackQueue';
import PooledClass from 'react/lib/PooledClass';
import Transaction from 'react-dom/lib/Transaction';
import ReactUpdateQueue from 'react-dom/lib/ReactUpdateQueue';

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
  this.reactMountReady = CallbackQueue.getPooled(this);
}

const Mixin = {
  getTransactionWrappers() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady() {
    return this.reactMountReady;
  },
  getUpdateQueue() {
    return ReactUpdateQueue;
  },
  checkpoint() {
    return this.reactMountReady.checkpoint();
  },
  rollback(checkpoint) {
    this.reactMountReady.rollback(checkpoint);
  },
  destructor() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};

Object.assign(
  ReactBlessedReconcileTransaction.prototype,
  Transaction,
  ReactBlessedReconcileTransaction,
  Mixin
);

PooledClass.addPoolingTo(ReactBlessedReconcileTransaction);

export default ReactBlessedReconcileTransaction;
