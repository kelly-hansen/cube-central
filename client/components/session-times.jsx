import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default class SessionTimes extends React.Component {
  render() {
    const timesList = [];
    for (let i = 0; i < this.props.sessionTimes.length; i++) {
      const displayTime = getDisplayTime(this.props.sessionTimes[i]);
      const newTime = (
        <div key={`time${i + 1}`}>
          <p>{`${i + 1}.`}</p>
          <p>{displayTime}</p>
          <p>X</p>
        </div>
      );
      timesList.push(newTime);
    }

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
