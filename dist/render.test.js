'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _render = require('./render');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class TestA extends _react.Component {
  componentDidMount() {
    // console.log('MOUNTED A');
  }
  render() {
    return _react2.default.createElement(
      'div',
      null,
      'OMG'
    );
  }
}

class TestB extends _react.Component {
  componentDidMount() {
    // console.log('MOUNTED B');
  }
  render() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(TestA, null),
      _react2.default.createElement(
        'div',
        null,
        'B'
      )
    );
  }
}

describe('render', () => {
  it('should render', () => {
    // const inst = render(<TestB />, {title: 'HOLYSHIT'});
    // console.log('GET INST', inst.getInstance());
  });
});