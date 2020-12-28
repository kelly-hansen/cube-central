import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default class SessionStats extends React.Component {

  getBest() {
    let best;
    this.props.sessionTimes.length > 0 ? best = getDisplayTime(Math.min(...this.props.sessionTimes)) : best = 'N/A';
    return best;
  }

  render() {
    const statsArray = [
      {
        name: 'Best',
        result: this.getBest()
      }
    ];
    console.log(statsArray);

    return (
      <div className="session-stats">
        <div className="d-flex justify-content-center mx-3">
          <p className="stat-col my-0 mr-1 text-right">Best:</p>
          <p className="stat-col my-0 ml-1 text-left">1:04.43</p>
        </div>
        <div className="d-flex justify-content-center mx-3">
          <p className="stat-col my-0 mr-1 text-right">Worst:</p>
          <p className="stat-col my-0 ml-1 text-left">1:58.97</p>
        </div>
      </div>
    );
  }
}
