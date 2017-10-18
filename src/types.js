// @flow

import type {Screen as BlessedScreen} from 'blessed';
import type ReactBlessedScreen from './ReactBlessedScreen';

// React core types
type DebugID = number;

export type ReactInstance = {
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

export type Source = {
  fileName: string,
  lineNumber: number
};

export type ReactElement = {
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

export type HostContainerInfo = ReactBlessedScreen;

export type BlessedRendererOptions = {
  screen?: BlessedScreen
};
