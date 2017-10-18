// @flow

import ReactInjection from 'react-dom/lib/ReactInjection';
import ReactDefaultBatchingStrategy from 'react-dom/lib/ReactDefaultBatchingStrategy';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import ReactBlessedComponent from './ReactBlessedComponent';

let injected = false;

export default function inject() {
  if (injected) return;
  injected = true;

  ReactInjection.Updates.injectReconcileTransaction(
    ReactBlessedReconcileTransaction
  );

  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.HostComponent.injectGenericComponentClass(
    ReactBlessedComponent
  );

  ReactInjection.Component.injectEnvironment({
    processChildrenUpdates: () => {},
    replaceNodeWithMarkup: () => {}
  });
}
