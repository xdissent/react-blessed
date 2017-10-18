// @flow

import CallbackQueue from 'react-dom/lib/CallbackQueue';
import PooledClass from 'react/lib/PooledClass';
import Transaction from 'react-dom/lib/Transaction';
import ReactUpdateQueue from 'react-dom/lib/ReactUpdateQueue';
import type {BlessedRendererOptions} from './types';

const ON_BLESSED_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: function() {
    this.reactMountReady.notifyAll();
  }
};

const TRANSACTION_WRAPPERS = [ON_BLESSED_READY_QUEUEING];

function ReactBlessedReconcileTransaction(
  blessedOptions: BlessedRendererOptions
) {
  this.reinitializeTransaction();
  this.blessedOptions = blessedOptions;
  this.reactMountReady = CallbackQueue.getPooled(this);
}

const Mixin = {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady: function() {
    return this.reactMountReady;
  },
  getBlessedOptions: function() {
    return this.blessedOptions;
  },
  getUpdateQueue: function() {
    return ReactUpdateQueue;
  },
  checkpoint: function() {
    return this.reactMountReady.checkpoint();
  },
  rollback: function(checkpoint) {
    this.reactMountReady.rollback(checkpoint);
  },
  destructor: function() {
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
