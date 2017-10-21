// @flow

import blessed, {type Node as BlessedNode} from 'blessed';
import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
import invariant from 'invariant';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import solveClass from './solveClass';
import update from './update';
import type {
  ReactElement,
  ReactBlessedInstanceComponent,
  HostContainerInfo
} from './types';

export default class ReactBlessedComponent {
  _currentElement: ReactElement;
  _topLevelWrapper: ?ReactBlessedInstanceComponent = null;
  _hostContainerInfo: ?HostContainerInfo = null;
  _renderedComponent: ReactBlessedComponent;
  _renderedChildren: ?Object = null;
  _blessedNode: ?BlessedNode = null;

  constructor(element: ReactElement) {
    this._currentElement = element;
  }

  _eventListener = (type: string, ...args: any[]) => {
    const handler = this._currentElement.props[
      'on' + `${type.charAt(0).toUpperCase()}${type.slice(1)}`.replace(/ /g, '')
    ];
    if (typeof handler === 'function') {
      if (type === 'focus' || type === 'blur') args[0] = this._blessedNode;
      handler(...args);
    }
  };

  mountComponent(
    transaction: ReactBlessedReconcileTransaction,
    hostParent: ?ReactBlessedComponent,
    hostContainerInfo: HostContainerInfo,
    context: Object
  ) {
    const {screen, render} = (this._hostContainerInfo = hostContainerInfo);
    invariant(screen, 'Could not find blessed screen');
    invariant(render, 'Could not find blessed render');

    const parent = (hostParent && hostParent._blessedNode) || screen;
    const node = (this._blessedNode = this.createBlessedNode(parent));

    const {content, children} = this.extractContentChildren();
    node.setContent(content);

    // $FlowFixMe
    this.mountChildren(children, transaction, context);
    render();
  }

  receiveComponent(
    nextElement: ReactElement,
    transaction: ReactBlessedReconcileTransaction,
    context: Object
  ) {
    this._currentElement = nextElement;
    const {render} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(render, 'Could not find blessed render');
    invariant(node, 'Could not find blessed node');

    const {props: {...props}} = nextElement;
    delete props.children;
    update(node, solveClass(props));

    const {content, children} = this.extractContentChildren();
    node.setContent(content);

    // $FlowFixMe
    this.updateChildren(children, transaction, context);
    render();
  }

  unmountComponent(safely: boolean, skipLifecycle: boolean) {
    // $FlowFixMe
    this.unmountChildren(safely, skipLifecycle);
    const {render} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(render, 'Could not find blessed render');
    invariant(node, 'Could not find blessed node');
    node.off('event', this._eventListener);
    node.destroy();
    this._blessedNode = null;
    render();
  }

  extractContentChildren(): {content: string, children: any[]} {
    const {props: {children}} = this._currentElement;
    return (children == null
      ? []
      : Array.isArray(children) ? children : [children]
    ).reduce(
      ({content, children}, child) => {
        if (typeof child === 'string' || typeof child === 'number') {
          content += child;
        } else {
          children.push(child);
        }
        return {content, children};
      },
      {content: '', children: []}
    );
  }

  createBlessedNode(parent: BlessedNode): BlessedNode {
    const {screen} = this._hostContainerInfo || {};
    invariant(screen, 'Could not find blessed screen');
    const {props, type} = this._currentElement;
    const blessedCreator = blessed[type];
    invariant(
      typeof blessedCreator === 'function',
      `Invalid blessed element "${type}".`
    );
    const node = blessedCreator({
      screen,
      ...solveClass({...props, children: []})
    });
    node.on('event', this._eventListener);
    parent.append(node);
    return node;
  }

  getPublicInstance(): BlessedNode {
    invariant(this._blessedNode, 'Could not find blessed node');
    return this._blessedNode;
  }

  getHostNode() {}
}

Object.assign(ReactBlessedComponent.prototype, ReactMultiChild.Mixin);
