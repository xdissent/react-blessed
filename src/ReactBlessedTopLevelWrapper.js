// @flow

const ReactBlessedTopLevelWrapper = function() {};
ReactBlessedTopLevelWrapper.prototype.isReactComponent = {};
ReactBlessedTopLevelWrapper.displayName = 'ReactBlessedTopLevelWrapper';
ReactBlessedTopLevelWrapper.prototype.render = function() {
  return this.props.child;
};
ReactBlessedTopLevelWrapper.isReactTopLevelWrapper = true;

export default ReactBlessedTopLevelWrapper;
