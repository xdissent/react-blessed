// @flow

import blessed, {Node as BlessedNode, Screen as BlessedScreen} from 'blessed';
import solveClass from './solveClass';
import invariant from 'invariant';
import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import {groupBy} from 'lodash';
import update from './update';

import type {ReactElement, ReactInstance, HostContainerInfo} from './types';

const CONTENT_TYPES = {string: true, number: true};

export default class ReactBlessedComponent {
  _currentElement: ReactElement;
  _renderedChildren: null | Object;
  _topLevelWrapper: null | ReactInstance;
  _hostContainerInfo: null | HostContainerInfo;
  _renderedComponent: ReactBlessedComponent;
  _blessedNode: null | BlessedNode;
  _updating: boolean;

  constructor(element: ReactElement) {
    this._currentElement = element;
    this._renderedChildren = null;
    this._topLevelWrapper = null;
    this._hostContainerInfo = null;
    this._blessedNode = null;
    this._updating = false;
  }

  _eventListener = (type: string, ...args: any[]) => {
    if (this._updating) return;
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
    const {screen} = (this._hostContainerInfo = hostContainerInfo);
    const node = (this._blessedNode = nativeParent
      ? this.createBlessedNode(nativeParent._blessedNode)
      : screen);
    invariant(screen, 'Could not find blessed screen');
    invariant(node, 'Could not find blessed node');
    const {content, children} = this.findContentChildren();
    if (typeof content === 'string') {
      if (node instanceof BlessedScreen)
        throw new Error('Cannot set content on screen');
      node.setContent(content);
    }
    // $FlowFixMe
    this.mountChildren(children, transaction, context);
    screen.debouncedRender();
  }

  receiveComponent(
    nextElement: ReactElement,
    transaction: ReactBlessedReconcileTransaction,
    context: Object
  ) {
    this._currentElement = nextElement;
    const {screen} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(screen, 'Could not find blessed screen');
    invariant(node, 'Could not find blessed node');

    const {props: {...props}} = nextElement;
    this._updating = true;
    delete props.children;
    update(this._blessedNode, solveClass(props));
    this._updating = false;

    const {content, children} = this.findContentChildren();
    if (typeof content === 'string') {
      if (node instanceof BlessedScreen)
        throw new Error('Cannot set content on screen');
      node.setContent(content);
    }
    // $FlowFixMe
    this.updateChildren(children, transaction, context);
    screen.debouncedRender();
  }

  findContentChildren(): {content: ?string, children: any[]} {
    const {props: {children}} = this._currentElement;
    const childrenToUse = children == null ? [] : [].concat(children);
    const {content = null, realChildren = []} = groupBy(childrenToUse, c => {
      return CONTENT_TYPES[typeof c] ? 'content' : 'realChildren';
    });
    return {
      content: content == null ? null : content.join(''),
      children: realChildren
    };
  }

  createBlessedNode(parent: ?BlessedNode): BlessedNode {
    invariant(parent, 'Could not find parent blessed node');
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

  unmountComponent(safely: boolean, skipLifecycle: boolean) {
    // $FlowFixMe
    this.unmountChildren(safely, skipLifecycle);
    const {screen} = this._hostContainerInfo || {};
    const node = this._blessedNode;
    invariant(screen, 'Could not find blessed screen');
    invariant(node, 'Could not find blessed node');
    node.off('event', this._eventListener);
    node.destroy();
    this._blessedNode = null;
    screen.debouncedRender();
  }

  getPublicInstance(): BlessedNode {
    if (!this._blessedNode) throw new Error('Could not find blessed node');
    return this._blessedNode;
  }

  getHostNode(...args: any[]): void {
    console.log('GET HOST NOED', ...args);
  }
}

Object.assign(ReactBlessedComponent.prototype, ReactMultiChild.Mixin);
