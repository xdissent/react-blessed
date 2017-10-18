// @flow

import type {Screen as BlessedScreen} from 'blessed';
import {debounce} from 'lodash';

export default class ReactBlessedScreen {
  screen: BlessedScreen;

  constructor(screen: BlessedScreen) {
    this.screen = screen;
  }

  render = debounce(() => this.screen.render(), 0);
}
