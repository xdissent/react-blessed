// @flow

import {createElement, type Element} from 'react';
import ReactReconciler from 'react-dom/lib/ReactReconciler';
import ReactUpdates from 'react-dom/lib/ReactUpdates';
import instantiateReactComponent from 'react-dom/lib/instantiateReactComponent';
import inject from './ReactBlessedInjection';
import {debounce} from 'lodash';
import invariant from 'invariant';
import ReactBlessedTopLevelWrapper from './ReactBlessedTopLevelWrapper';
import ReactBlessedInstance from './ReactBlessedInstance';
import type {Screen as BlessedScreen} from 'blessed';

inject();

function mountComponentIntoNode(
  componentInstance,
  transaction,
  hostParent,
  hostContainerInfo
) {
  const image = ReactReconciler.mountComponent(
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
  const transaction = ReactUpdates.ReactReconcileTransaction.getPooled();
  const image = transaction.perform(
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

export const render = (
  nextElement: Element<any>,
  screen: BlessedScreen
): ReactBlessedInstance => {
  invariant(screen, 'Could not find blessed screen');

  // HACK
  // $FlowFixMe
  screen.debouncedRender = debounce(() => screen.render(), 0);

  // $FlowFixMe
  const nextWrappedElement = createElement(ReactBlessedTopLevelWrapper, {
    child: nextElement
  });

  const instance = instantiateReactComponent(nextWrappedElement, false);
  ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, instance, {
    screen
  });
  return new ReactBlessedInstance(instance);
};
