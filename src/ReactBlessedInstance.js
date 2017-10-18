// @flow

import {createElement, type Element} from 'react';
import ReactReconciler from 'react-dom/lib/ReactReconciler';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import invariant from 'invariant';
import ReactBlessedTopLevelWrapper from './ReactBlessedTopLevelWrapper';
import type ReactBlessedComponent from './ReactBlessedComponent';
import type {ReactInstance} from './types';
import type {Node as BlessedNode, Screen as BlessedScreen} from 'blessed';

type ReactBlessedInstanceComponent = {
  ...$Exact<ReactInstance>,
  _renderedComponent: ReactBlessedComponent
};

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
    invariant(component, 'Cannot get instance after unmount');
    return component._renderedComponent.getPublicInstance();
  }

  getScreen(): BlessedScreen {
    const component = this._component;
    invariant(component, 'Cannot get instance after unmount');
    const {screen} = component._renderedComponent._hostContainerInfo || {};
    invariant(screen, 'Could not find blessed screen');
    return screen;
  }
}
