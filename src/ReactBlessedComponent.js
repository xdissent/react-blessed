// @flow

import blessed, {Node as BlessedNode} from 'blessed';
import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
import invariant from 'invariant';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import solveClass from './solveClass';
import update from './update';
import type {ReactElement, ReactInstance, HostContainerInfo} from './types';

export default class ReactBlessedComponent {
  _currentElement: ReactElement;
  _renderedChildren: null | Object;
  _topLevelWrapper: null | ReactInstance;
  _hostContainerInfo: null | HostContainerInfo;
  _renderedComponent: ReactBlessedComponent;
  _blessedNode: null | BlessedNode;

  constructor(element: ReactElement) {
    this._currentElement = element;
    this._renderedChildren = null;
    this._topLevelWrapper = null;
    this._hostContainerInfo = null;
    this._blessedNode = null;
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
    nativeParent: ?ReactBlessedComponent,
    hostContainerInfo: HostContainerInfo,
    context: Object
  ) {
    const {screen, render} = (this._hostContainerInfo = hostContainerInfo);
    invariant(screen, 'Could not find blessed screen');
    invariant(render, 'Could not find blessed render');

    const parent = (nativeParent && nativeParent._blessedNode) || screen;
    const node = (this._blessedNode = this.createBlessedNode(parent));

    const {content, children} = this.findContentChildren();
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
    const {screen, render} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(screen, 'Could not find blessed screen');
    invariant(render, 'Could not find blessed render');
    invariant(node, 'Could not find blessed node');

    const {props: {...props}} = nextElement;
    delete props.children;
    update(node, solveClass(props));

    const {content, children} = this.findContentChildren();
    node.setContent(content);

    // $FlowFixMe
    this.updateChildren(children, transaction, context);
    render();
  }

  unmountComponent(safely: boolean, skipLifecycle: boolean) {
    // $FlowFixMe
    this.unmountChildren(safely, skipLifecycle);
    const {screen, render} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(screen, 'Could not find blessed screen');
    invariant(render, 'Could not find blessed render');
    invariant(node, 'Could not find blessed node');
    node.off('event', this._eventListener);
    node.destroy();
    this._blessedNode = null;
    render();
  }

  findContentChildren(): {content: string, children: any[]} {
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
    const {props: {...props}, type} = this._currentElement;
    const blessedCreator = blessed[type];
    invariant(
      typeof blessedCreator === 'function',
      `Invalid blessed element "${type}".`
    );
    delete props.children;
    const node = blessedCreator(solveClass(props));
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
