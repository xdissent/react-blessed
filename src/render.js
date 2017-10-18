// @flow

import React, {createElement, type Element} from 'react';
import ReactReconciler from 'react-dom/lib/ReactReconciler';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
// import ReactBlessedIDOperations from './ReactBlessedIDOperations';
import invariant from 'invariant';
import instantiateReactComponent from 'react-dom/lib/instantiateReactComponent';
import getHostComponentFromComposite from 'react-dom/lib/getHostComponentFromComposite';
import inject from './ReactBlessedInjection';
import ReactBlessedComponent from './ReactBlessedComponent';
// import {Screen} from 'blessed';
import type {BlessedRendererOptions} from './ReactBlessedReconcileTransaction';
import {debounce} from 'lodash';

inject();

const defaultBlessedOptions = {
  title: 'TRULY BLESSD!'
};

const TopLevelWrapper = function() {};
TopLevelWrapper.prototype.isReactComponent = {};
if (process.env.NODE_ENV !== 'production') {
  TopLevelWrapper.displayName = 'TopLevelWrapper';
}
TopLevelWrapper.prototype.render = function() {
  return <screen>{this.props.child}</screen>;
};
TopLevelWrapper.isReactTopLevelWrapper = true;

function mountComponentIntoNode(
  componentInstance,
  transaction,
  hostParent,
  hostContainerInfo
) {
  var image = ReactReconciler.mountComponent(
    componentInstance,
    transaction,
    null,
    hostContainerInfo,
    {}
  );
  componentInstance._renderedComponent._topLevelWrapper = componentInstance;
  return image;
}

function batchedMountComponentIntoNode(componentInstance, options) {
  var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  var image = transaction.perform(
    mountComponentIntoNode,
    null,
    componentInstance,
    transaction,
    null,
    options
  );
  ReactUpdates.ReactReconcileTransaction.release(transaction);
  return image;
}

class ReactBlessedInstance {
  _component: ?ReactBlessedComponent;

  constructor(component) {
    this._component = component;
  }
  getInstance() {
    // console.log('HEYO', this._component._renderedComponent);
    return (
      this._component && this._component._renderedComponent.getPublicInstance()
    );
  }
  update(nextElement) {
    invariant(
      this._component,
      "ReactTestRenderer: .update() can't be called after unmount."
    );
    var nextWrappedElement = createElement(TopLevelWrapper, {
      child: nextElement
    });
    var component = this._component;
    ReactUpdates.batchedUpdates(function() {
      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(function() {
        ReactReconciler.receiveComponent(
          component,
          nextWrappedElement,
          transaction,
          {}
        );
      });
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    });
  }
  unmount(nextElement) {
    var component = this._component;
    ReactUpdates.batchedUpdates(function() {
      var transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(function() {
        ReactReconciler.unmountComponent(component, false);
      });
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    });
    // HACK
    if (nextElement) this._component = null;
    this._component = null;
  }
  toJSON() {
    var inst = getHostComponentFromComposite(this._component);
    if (inst === null) {
      return null;
    }
    return inst.toJSON();
  }
}

export const render = (
  nextElement: Element<any>,
  options?: BlessedRendererOptions
): ReactBlessedInstance => {
  const nextWrappedElement = createElement(TopLevelWrapper, {
    child: nextElement
  });

  if (options && options.screen)
    options.screen.debouncedRender = debounce(() => options.screen.render(), 0);
  const instance = instantiateReactComponent(nextWrappedElement, false);
  ReactUpdates.batchedUpdates(
    batchedMountComponentIntoNode,
    instance,
    Object.assign({}, defaultBlessedOptions, options)
  );
  return new ReactBlessedInstance(instance);
};
