import React from 'react';

export default class MyRecords extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzletype: '3x3x3 Cube',
      records: {
        bestSingle: null,
        bestAverage3Of5Arr: null
      }
    };
  }

  render() {
    return (
      <>
      </>
    );
  }
}
