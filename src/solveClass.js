// @flow

import merge from 'lodash.merge';

export default function solveClass(props: Object): Object {
  let {class: classes, ...rest} = props;
  classes =
    classes == null || typeof classes !== 'object'
      ? []
      : Array.isArray(classes) ? classes.filter(c => c) : [classes];
  return merge({}, ...classes, rest);
}
