// @flow

import React, {Component} from 'react';

import {render} from './render';

class TestA extends Component<{}> {
  componentDidMount() {
    // console.log('MOUNTED A');
  }
  render() {
    return <div>OMG</div>;
  }
}

class TestB extends Component<{}> {
  componentDidMount() {
    // console.log('MOUNTED B');
  }
  render() {
    return (
      <div>
        <TestA />
        <div>B</div>
      </div>
    );
  }
}

describe('render', () => {
  it('should render', () => {
    const inst = render(<TestB />, {title: 'HOLYSHIT'});
    // console.log('GET INST', inst.getInstance());
  });
});
