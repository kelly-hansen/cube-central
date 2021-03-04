import React from 'react';
import virtualCube from '../lib/virtualcube';

export default function VirtualCube(props) {
  virtualCube();
  return <div className="virtualcube" kind={props.type} stickersimage="cubecolors.gif"></div>;
}
