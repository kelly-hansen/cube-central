import React from 'react';
import virtualCube from '../lib/virtualcube';

export default class VirtualCube extends React.Component {

  render() {
    virtualCube();
    return <div className="virtualcube" kind="RubiksCube" stickersimage="RubiksCube_512.gif"></div>;
  }
}
