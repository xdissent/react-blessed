// @flow

import ReactInjection from 'react-dom/lib/ReactInjection';
import ReactDefaultBatchingStrategy from 'react-dom/lib/ReactDefaultBatchingStrategy';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import ReactBlessedComponent from './ReactBlessedComponent';

class ReactBlessedEmptyComponent {
  _currentElement: null;
  constructor() {
    // console.log('ReactBlessedEmptyComponent');
    this._currentElement = null;
  }
  receiveComponent() {}
  toJSON() {}
  mountComponent() {}
  getHostNode() {
    console.log('ReactBlessedEmptyComponent GET HOST NODe');
  }
  unmountComponent() {}
}

class ReactBlessedTextComponent {
  _currentElement: string | number;
  constructor(element) {
    // console.log('ReactBlessedTextComponent');
    this._currentElement = element;
  }
  receiveComponent(nextElement) {
    this._currentElement = nextElement;
  }
  toJSON() {
    return this._currentElement;
  }
  mountComponent() {}
  getHostNode() {
    console.log('ReactBlessedTextComponent GET HOST NODe');
  }
  unmountComponent() {}
}

export default function inject() {
  ReactInjection.Updates.injectReconcileTransaction(
    ReactBlessedReconcileTransaction
  );

  ReactInjection.Updates.injectBatchingStrategy(ReactDefaultBatchingStrategy);

  ReactInjection.HostComponent.injectGenericComponentClass(
    ReactBlessedComponent
  );

  ReactInjection.HostComponent.injectTextComponentClass(
    ReactBlessedTextComponent
  );

  ReactInjection.EmptyComponent.injectEmptyComponentFactory(function() {
    return new ReactBlessedEmptyComponent();
  });

  ReactInjection.Component.injectEnvironment({
    processChildrenUpdates: function() {},
    replaceNodeWithMarkup: function() {}
  });
}
