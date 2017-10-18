'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ReactBlessedScreen {

  constructor(screen) {
    this._rendering = false;

    this.render = () => {
      if (this._rendering) return;
      this._rendering = true;
      setTimeout(() => {
        this.screen.render();
        this._rendering = false;
      }, 0);
    };

    this.screen = screen;
  }

}
exports.default = ReactBlessedScreen;