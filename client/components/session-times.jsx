import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default class SessionTimes extends React.Component {
  render() {
    const timesList = this.props.sessionTimes.map((time, i) => {
      const displayTime = getDisplayTime(this.props.sessionTimes[i]);
      const newTime = (
        <div key={`time${i + 1}`} className="d-flex justify-content-center">
          <p className="time-number my-0 text-right">{`${i + 1}.`}</p>
          <p className="time-display my-0 text-center">{displayTime}</p>
          <i className="fas fa-times-circle time-delete d-flex align-items-center my-0 text-left" data-time-index={i}></i>
        </div>
      );
      return newTime;
    });

    return (
      <div className="session-times">
        <p>Times</p>
        <div className="times-list">
          {timesList}
        </div>
      </div>
    );
  }
}
