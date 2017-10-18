// @flow

/**
 * React Blessed Update Schemes
 * =============================
 *
 * Applying updates to blessed nodes correctly.
 */
import merge from 'lodash.merge';
import type {Node as BlessedNode} from 'blessed';

const RAW_ATTRIBUTES = new Set([
  // Alignment, Orientation & Presentation
  'align',
  'valign',
  'orientation',
  'shrink',
  'padding',
  'tags',
  'shadow',

  // Font-related
  'font',
  'fontBold',
  'fch',
  'ch',
  'bold',
  'underline',

  // Flags
  'clickable',
  'input',
  'keyable',
  'hidden',
  'visible',
  'scrollable',
  'draggable',
  'interactive',

  // Position
  'left',
  'right',
  'top',
  'bottom',
  'aleft',
  'aright',
  'atop',
  'abottom',

  // Size
  'width',
  'height',

  // Checkbox
  'checked',

  // Misc
  'name'
]);

export default function update(node: BlessedNode, options: Object) {
  // TODO: enforce some kind of shallow equality?
  // TODO: handle position

  const selectQue = [];

  for (let key in options) {
    let value = options[key];

    if (key === 'selected' && node.select)
      selectQue.push({
        node,
        value: typeof value === 'string' ? +value : value
      });
    else if (key === 'label')
      // Setting label
      node.setLabel(value);
    else if (key === 'hoverText' && !value)
      // Removing hoverText
      node.removeHover();
    else if (key === 'hoverText' && value)
      // Setting hoverText
      node.setHover(value);
    else if (key === 'style')
      // Updating style
      node.style = merge({}, node.style, value);
    else if (key === 'items')
      // Updating items
      node.setItems(value);
    else if (key === 'border')
      // Border edge case
      node.border = merge({}, node.border, value);
    else if (key === 'value' && node.setValue)
      // Textarea value
      node.setValue(value);
    else if (key === 'filled' && node.filled !== value)
      // Progress bar
      node.setProgress(value);
    else if ((key === 'rows' || key === 'data') && node.setData)
      // Table / ListTable rows / data
      node.setData(value);
    else if (key === 'focused' && value && !node.focused) node.focus();
    else if (RAW_ATTRIBUTES.has(key))
      // $FlowFixMe
      node[key] = value;
  }

  selectQue.forEach(({node, value}) => node.select(value));
}
