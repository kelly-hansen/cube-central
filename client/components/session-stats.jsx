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

  getAverage(times) {
    let avg;
    times.length > 0 ? avg = getDisplayTime(times.reduce((acc, cur) => acc + cur) / times.length) : avg = 'N/A';
    return avg;
  }

  getMedian(times) {
    const timesCopy = times.slice();
    let median;
    if (times.length > 0) {
      timesCopy.sort((a, b) => a - b);
      const split = Math.floor(timesCopy.length / 2);
      if (timesCopy.length % 2) {
        median = getDisplayTime(timesCopy[split]);
      } else {
        median = getDisplayTime((timesCopy[split] + timesCopy[split - 1]) / 2);
      }
    } else {
      median = 'N/A';
    }
    return median;
  }

  getStdDeviation(times) {
    if (times.length > 0) {
      const avg = times.reduce((acc, cur) => acc + cur) / times.length;
      const varianceArr = times.map(time => Math.pow((time - avg), 2));
      const variance = varianceArr.reduce((acc, cur) => acc + cur) / varianceArr.length;
      const stdDeviation = Math.sqrt(variance);
      return getDisplayTime(stdDeviation);
    } else {
      return 'N/A';
    }
  }

  render() {
    const times = this.props.sessionTimes.slice();
    const statsArray = [
      {
        name: 'Best',
        result: this.getBest(times)
      },
      {
        name: 'Worst',
        result: this.getWorst(times)
      },
      {
        name: 'Average',
        result: this.getAverage(times)
      },
      {
        name: 'Median',
        result: this.getMedian(times)
      },
      {
        name: 'Std Deviation',
        result: this.getStdDeviation(times)
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
