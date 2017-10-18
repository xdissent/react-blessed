// @flow

import {createElement, type Element} from 'react';
import ReactReconciler from 'react-dom/lib/ReactReconciler';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import instantiateReactComponent from 'react-dom/lib/instantiateReactComponent';
import inject from './ReactBlessedInjection';
import invariant from 'invariant';
import ReactBlessedTopLevelWrapper from './ReactBlessedTopLevelWrapper';
import ReactBlessedInstance from './ReactBlessedInstance';
import ReactBlessedScreen from './ReactBlessedScreen';
import type ReactBlessedComponent from './ReactBlessedComponent';
import type {Screen as BlessedScreen} from 'blessed';
import type {ReactInstance, ReactBlessedInstanceComponent} from './types';

function mountComponentIntoNode(
  instance: ReactBlessedInstanceComponent,
  transaction: any,
  hostParent: ?ReactBlessedComponent,
  hostContainerInfo: ReactBlessedScreen
) {
  const image = ReactReconciler.mountComponent(
    instance,
    transaction,
    hostParent,
    hostContainerInfo,
    {}
  );
  instance._renderedComponent._topLevelWrapper = instance;
  return image;
}

function batchedMountComponentIntoNode(
  instance: ReactInstance,
  hostContainerInfo: ReactBlessedScreen
) {
  const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  const image = transaction.perform(
    mountComponentIntoNode,
    null,
    instance,
    transaction,
    null,
    hostContainerInfo
  );
  ReactUpdates.ReactReconcileTransaction.release(transaction);
  return image;
}

export const render = (
  element: Element<any>,
  screen: BlessedScreen
): ReactBlessedInstance => {
  invariant(screen, 'Could not find blessed screen');
  inject();
  const wrapped = createElement(ReactBlessedTopLevelWrapper, {
    child: element
  });
  const instance = instantiateReactComponent(wrapped, false);
  ReactUpdates.batchedUpdates(
    batchedMountComponentIntoNode,
    instance,
    new ReactBlessedScreen(screen)
  );
  return new ReactBlessedInstance(instance);
};
