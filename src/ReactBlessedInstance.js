// @flow

import {createElement, type Element} from 'react';
import ReactReconciler from 'react-dom/lib/ReactReconciler';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import invariant from 'invariant';
import ReactBlessedTopLevelWrapper from './ReactBlessedTopLevelWrapper';
import type {ReactBlessedInstanceComponent} from './types';
import type {Node as BlessedNode, Screen as BlessedScreen} from 'blessed';

export default class ReactBlessedInstance {
  _component: ?ReactBlessedInstanceComponent;

  constructor(component: ReactBlessedInstanceComponent) {
    this._component = component;
  }

  update(nextElement: Element<any>) {
    const component = this._component;
    invariant(component, 'Cannot update after unmount');
    const nextWrappedElement = createElement(ReactBlessedTopLevelWrapper, {
      child: nextElement
    });
    ReactUpdates.batchedUpdates(() => {
      const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {
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

  unmount() {
    const component = this._component;
    if (!component) return;
    ReactUpdates.batchedUpdates(() => {
      const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
      transaction.perform(() => {
        ReactReconciler.unmountComponent(component, false);
      });
      ReactUpdates.ReactReconcileTransaction.release(transaction);
    });
    this._component = null;
  }

  getNode(): BlessedNode {
    const component = this._component;
    invariant(component, 'Cannot get node after unmount');
    return component._renderedComponent.getPublicInstance();
  }

  getScreen(): BlessedScreen {
    const component = this._component;
    invariant(component, 'Cannot get screen after unmount');
    const {screen} = component._renderedComponent._hostContainerInfo || {};
    invariant(screen, 'Could not find blessed screen');
    return screen;
  }

  render() {
    const component = this._component;
    invariant(component, 'Cannot render after unmount');
    const {render} = component._renderedComponent._hostContainerInfo || {};
    invariant(render, 'Could not find blessed render');
    render();
  }
}
