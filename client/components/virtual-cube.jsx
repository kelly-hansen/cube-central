import React from 'react';
import virtualCube from '../lib/virtualcube';

export default class VirtualCube extends React.Component {

  render() {
    virtualCube();
    return <div className="virtualcube" kind={this.props.type} stickersimage="cubecolors.gif"></div>;
  }
}
