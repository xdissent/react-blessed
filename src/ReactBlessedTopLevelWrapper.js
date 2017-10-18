// @flow

import React from 'react';

const ReactBlessedTopLevelWrapper = function() {};
ReactBlessedTopLevelWrapper.prototype.isReactComponent = {};
ReactBlessedTopLevelWrapper.displayName = 'ReactBlessedTopLevelWrapper';
// eslint-disable-next-line react/display-name
ReactBlessedTopLevelWrapper.prototype.render = function() {
  return <screen>{this.props.child}</screen>;
};
ReactBlessedTopLevelWrapper.isReactTopLevelWrapper = true;

export default ReactBlessedTopLevelWrapper;
