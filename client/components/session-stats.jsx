import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default class SessionStats extends React.Component {

  getBest(times) {
    let best;
    times.length > 0 ? best = getDisplayTime(Math.min(...times)) : best = 'N/A';
    return best;
  }

  getWorst(times) {
    let worst;
    times.length > 0 ? worst = getDisplayTime(Math.max(...times)) : worst = 'N/A';
    return worst;
  }

  render() {
    const times = this.props.sessionTimes;
    const statsArray = [
      {
        name: 'Best',
        result: this.getBest(times)
      },
      {
        name: 'Worst',
        result: this.getWorst(times)
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
