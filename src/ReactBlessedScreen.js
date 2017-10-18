// @flow

import type {Screen as BlessedScreen} from 'blessed';

export default class ReactBlessedScreen {
  screen: BlessedScreen;
  _rendering: boolean = false;

  constructor(screen: BlessedScreen) {
    this.screen = screen;
  }

  render = () => {
    if (this._rendering) return;
    this._rendering = true;
    setTimeout(() => {
      this.screen.render();
      this._rendering = false;
    }, 0);
  };
}
