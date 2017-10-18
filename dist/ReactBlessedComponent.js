'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _blessed = require('blessed');

var _blessed2 = _interopRequireDefault(_blessed);

var _ReactMultiChild = require('react-dom/lib/ReactMultiChild');

var _ReactMultiChild2 = _interopRequireDefault(_ReactMultiChild);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _ReactBlessedReconcileTransaction = require('./ReactBlessedReconcileTransaction');

var _ReactBlessedReconcileTransaction2 = _interopRequireDefault(_ReactBlessedReconcileTransaction);

var _solveClass = require('./solveClass');

var _solveClass2 = _interopRequireDefault(_solveClass);

var _update = require('./update');

var _update2 = _interopRequireDefault(_update);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

class ReactBlessedComponent {

  constructor(element) {
    this._topLevelWrapper = null;
    this._hostContainerInfo = null;
    this._renderedChildren = null;
    this._blessedNode = null;

    this._eventListener = (type, ...args) => {
      const handler = this._currentElement.props['on' + `${type.charAt(0).toUpperCase()}${type.slice(1)}`.replace(/ /g, '')];
      if (typeof handler === 'function') {
        if (type === 'focus' || type === 'blur') args[0] = this._blessedNode;
        handler(...args);
      }
    };

    this._currentElement = element;
  }

  mountComponent(transaction, hostParent, hostContainerInfo, context) {
    const { screen, render } = this._hostContainerInfo = hostContainerInfo;
    (0, _invariant2.default)(screen, 'Could not find blessed screen');
    (0, _invariant2.default)(render, 'Could not find blessed render');

    const parent = hostParent && hostParent._blessedNode || screen;
    const node = this._blessedNode = this.createBlessedNode(parent);

    const { content, children } = this.extractContentChildren();
    node.setContent(content);

    // $FlowFixMe
    this.mountChildren(children, transaction, context);
    render();
  }

  receiveComponent(nextElement, transaction, context) {
    this._currentElement = nextElement;
    const { render } = this._hostContainerInfo || {};
    const node = this._blessedNode;
    (0, _invariant2.default)(render, 'Could not find blessed render');
    (0, _invariant2.default)(node, 'Could not find blessed node');

    const {} = nextElement,
          props = _objectWithoutProperties(nextElement.props, []);
    delete props.children;
    (0, _update2.default)(node, (0, _solveClass2.default)(props));

    const { content, children } = this.extractContentChildren();
    node.setContent(content);

    // $FlowFixMe
    this.updateChildren(children, transaction, context);
    render();
  }

  unmountComponent(safely, skipLifecycle) {
    // $FlowFixMe
    this.unmountChildren(safely, skipLifecycle);
    const { render } = this._hostContainerInfo || {};
    const node = this._blessedNode;
    (0, _invariant2.default)(render, 'Could not find blessed render');
    (0, _invariant2.default)(node, 'Could not find blessed node');
    node.off('event', this._eventListener);
    node.destroy();
    this._blessedNode = null;
    render();
  }

  extractContentChildren() {
    const { props: { children } } = this._currentElement;
    return (children == null ? [] : Array.isArray(children) ? children : [children]).reduce(({ content, children }, child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        content += child;
      } else {
        children.push(child);
      }
      return { content, children };
    }, { content: '', children: [] });
  }

  createBlessedNode(parent) {
    const { screen } = this._hostContainerInfo || {};
    (0, _invariant2.default)(screen, 'Could not find blessed screen');
    const { props, type } = this._currentElement;
    const blessedCreator = _blessed2.default[type];
    (0, _invariant2.default)(typeof blessedCreator === 'function', `Invalid blessed element "${type}".`);
    const node = blessedCreator(_extends({
      screen
    }, (0, _solveClass2.default)(_extends({}, props, { children: [] }))));
    node.on('event', this._eventListener);
    parent.append(node);
    return node;
  }

  getPublicInstance() {
    (0, _invariant2.default)(this._blessedNode, 'Could not find blessed node');
    return this._blessedNode;
  }

  getHostNode() {}
}

exports.default = ReactBlessedComponent;
Object.assign(ReactBlessedComponent.prototype, _ReactMultiChild2.default.Mixin);