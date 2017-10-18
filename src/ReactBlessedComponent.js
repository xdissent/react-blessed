// @flow

import blessed from 'blessed';
import solveClass from './solveClass';
import invariant from 'invariant';
import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
import ReactBlessedReconcileTransaction from './ReactBlessedReconcileTransaction';
import {extend, groupBy, startCase} from 'lodash';
import update from './update';

const CONTENT_TYPES = {string: true, number: true};

type DebugID = number;

type ReactInstance = {
  // ReactCompositeComponent
  mountComponent: any,
  performInitialMountWithErrorHandling: any,
  performInitialMount: any,
  getHostNode: any,
  unmountComponent: any,
  receiveComponent: any,
  performUpdateIfNecessary: any,
  updateComponent: any,
  attachRef: (ref: string, component: ReactInstance) => void,
  detachRef: (ref: string) => void,
  getName: () => string,
  getPublicInstance: any,
  _rootNodeID: number,

  // ReactDOMComponent
  _tag: string,

  // instantiateReactComponent
  _mountIndex: number,
  _mountImage: any,
  // __DEV__
  _debugID: DebugID,
  _warnedAboutRefsInRender: boolean
};

type Source = {
  fileName: string,
  lineNumber: number
};

type ReactElement = {
  $$typeof: any,
  type: any,
  key: any,
  ref: any,
  props: any,
  _owner: ReactInstance,

  // __DEV__
  _store: {
    validated: boolean
  },
  _self: ReactElement,
  _shadowChildren: any,
  _source: Source
};

type ReactBlessedRendererJSON = {
  type: string,
  props: {[propName: string]: string},
  children: null | Array<string | ReactBlessedRendererJSON>,
  $$typeof?: any
};

export default class ReactBlessedComponent {
  _currentElement: ReactElement;
  _renderedChildren: null | Object;
  _topLevelWrapper: null | ReactInstance;
  _hostContainerInfo: null | Object;
  _renderedComponent: ReactBlessedComponent;
  _blessedNode: any;
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
    nativeParent: null | ReactBlessedComponent,
    hostContainerInfo: Object,
    context: Object
  ) {
    const element = this._currentElement;
    this._hostContainerInfo = hostContainerInfo;
    const {screen} = hostContainerInfo;
    this._blessedNode = nativeParent
      ? this.mountNode(nativeParent._blessedNode)
      : screen;
    let childrenToUse = this._currentElement.props.children;
    childrenToUse = childrenToUse === null ? [] : [].concat(childrenToUse);
    if (childrenToUse.length) {
      const {content = null, realChildren = []} = groupBy(childrenToUse, c => {
        return CONTENT_TYPES[typeof c] ? 'content' : 'realChildren';
      });
      if (content) this._blessedNode.setContent('' + content.join(''));
      this.mountChildren(realChildren, transaction, context);
    }
    screen.debouncedRender();
  }

  mountNode(parent: any) {
    const {props: {children, ...props}, type} = this._currentElement;
    invariant(!!blessed[type], `Invalid blessed element "${type}".`);
    const node = blessed[type](solveClass(props));
    node.on('event', this._eventListener);
    parent.append(node);
    return node;
  }

  receiveComponent(
    nextElement: ReactElement,
    transaction: ReactBlessedReconcileTransaction,
    context: Object
  ) {
    this._currentElement = nextElement;
    const {props: {children, ...props}} = nextElement;
    this._updating = true;
    update(this._blessedNode, solveClass(props));
    this._updating = false;
    const childrenToUse = children === null ? [] : [].concat(children);
    const {content = null, realChildren = []} = groupBy(childrenToUse, c => {
      return CONTENT_TYPES[typeof c] ? 'content' : 'realChildren';
    });
    if (content) this._blessedNode.setContent('' + content.join(''));
    this.updateChildren(realChildren, transaction, context);
    const {screen} = this._hostContainerInfo;
    screen.debouncedRender();
  }

  getPublicInstance(): Object {
    return this._blessedNode;
  }

  getHostNode(...args: any[]): void {
    console.log('GET HOST NOED', ...args);
  }

  unmountComponent(safely: boolean, skipLifecycle: boolean): void {
    this.unmountChildren(safely, skipLifecycle);
  }
}

Object.assign(ReactBlessedComponent.prototype, ReactMultiChild.Mixin);

// /**
//  * React Blessed Component
//  * ========================
//  *
//  * React component abstraction for the blessed library.
//  */
// import blessed from 'blessed';
// import ReactMultiChild from 'react-dom/lib/ReactMultiChild';
// import ReactBlessedIDOperations from './ReactBlessedIDOperations';
// import invariant from 'invariant';
// import update from './update';
// import solveClass from './solveClass';
// import {extend, groupBy, startCase} from 'lodash';
//
// /**
//  * Variable types that must be solved as content rather than real children.
//  */
// const CONTENT_TYPES = {string: true, number: true};
//
// /**
//  * Renders the given react element with blessed.
//  *
//  * @constructor ReactBlessedComponent
//  * @extends ReactMultiChild
//  */
// export default class ReactBlessedComponent {
//   constructor(element) {
//     console.log('THIS!', this)
//
//     // Setting some properties
//     this._currentElement = element;
//     this._renderedChildren = null;
//     this._topLevelWrapper = null;
//     this._hostContainerInfo = null;
//
//     this._eventListener = (type, ...args) => {
//       if (this._updating) return;
//
//       const handler = this._currentElement.props['on' + startCase(type).replace(/ /g, '')];
//
//       if (typeof handler === 'function') {
//         if (type === 'focus' || type === 'blur') {
//           args[0] = ReactBlessedIDOperations.get(this._rootNodeID)
//         }
//         handler(...args);
//       }
//     };
//   }
//
//   /**
//    * Mounting the root component.
//    *
//    * @internal
//    * @param  {string} 'rootID' - The root blessed ID for this node.
//    * @param  {ReactBlessedReconcileTransaction} transaction
//    * @param  {object} context
//    */
//   mountComponent(transaction, nativeParent, hostContainerInfo, context) {
//     this._hostContainerInfo = hostContainerInfo
//
//     console.log('mount', this, transaction, nativeParent, hostContainerInfo, context)
//
//     // Mounting blessed node
//     const node = this.mountNode(
//       ReactBlessedIDOperations.getParent(this._rootNodeID),
//       this._currentElement
//     );
//
//     ReactBlessedIDOperations.add(this._rootNodeID, node);
//
//     // Mounting children
//     let childrenToUse = this._currentElement.props.children;
//     childrenToUse = childrenToUse === null ? [] : [].concat(childrenToUse);
//
//     if (childrenToUse.length) {
//
//       // Discriminating content components from real children
//       const {content=null, realChildren=[]} = groupBy(childrenToUse, (c) => {
//         return CONTENT_TYPES[typeof c] ? 'content' : 'realChildren';
//       });
//
//       // Setting textual content
//       if (content)
//         node.setContent('' + content.join(''));
//
//       // Mounting real children
//       this.mountChildren(
//         realChildren,
//         transaction,
//         context
//       );
//     }
//
//     // Rendering the screen
//     ReactBlessedIDOperations.screen.debouncedRender();
//   }
//
//   /**
//    * Mounting the blessed node itself.
//    *
//    * @param   {BlessedNode|BlessedScreen} parent  - The parent node.
//    * @param   {ReactElement}              element - The element to mount.
//    * @return  {BlessedNode}                       - The mounted node.
//    */
//   mountNode(parent, element) {
//     const {props, type} = element,
//           {children, ...options} = props,
//           blessedElement = blessed[type];
//
//     invariant(
//       !!blessedElement,
//       `Invalid blessed element "${type}".`
//     );
//
//     const node = blessed[type](solveClass(options));
//
//     node.on('event', this._eventListener);
//     parent.append(node);
//
//     return node;
//   }
//
//   /**
//    * Receive a component update.
//    *
//    * @param {ReactElement}              nextElement
//    * @param {ReactReconcileTransaction} transaction
//    * @param {object}                    context
//    * @internal
//    * @overridable
//    */
//   receiveComponent(nextElement, transaction, context) {
//     const {props: {children, ...options}} = nextElement,
//           node = ReactBlessedIDOperations.get(this._rootNodeID);
//
//     this._updating = true;
//     update(node, solveClass(options));
//     this._updating = false;
//
//     // Updating children
//     const childrenToUse = children === null ? [] : [].concat(children);
//
//     // Discriminating content components from real children
//     const {content=null, realChildren=[]} = groupBy(childrenToUse, (c) => {
//       return CONTENT_TYPES[typeof c] ? 'content' : 'realChildren';
//     });
//
//     // Setting textual content
//     if (content)
//       node.setContent('' + content.join(''));
//
//     this.updateChildren(realChildren, transaction, context);
//
//     ReactBlessedIDOperations.screen.debouncedRender();
//   }
//
//   /**
//    * Dropping the component.
//    */
//   unmountComponent() {
//     this.unmountChildren();
//
//     const node = ReactBlessedIDOperations.get(this._rootNodeID);
//
//     node.off('event', this._eventListener);
//     node.destroy();
//
//     ReactBlessedIDOperations.drop(this._rootNodeID);
//
//     this._rootNodeID = null;
//
//     ReactBlessedIDOperations.screen.debouncedRender();
//   }
//
//   /**
//    * Getting a public instance of the component for refs.
//    *
//    * @return {BlessedNode} - The instance's node.
//    */
//   getPublicInstance() {
//     return ReactBlessedIDOperations.get(this._rootNodeID);
//   }
// }
//
// /**
//  * Extending the component with the MultiChild mixin.
//  */
// Object.assign(
//   ReactBlessedComponent.prototype,
//   ReactMultiChild.Mixin
// );
