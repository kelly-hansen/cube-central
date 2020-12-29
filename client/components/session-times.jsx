import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default class SessionTimes extends React.Component {
  constructor(props) {
    super(props);
    this.deleteTimeByIndex = this.deleteTimeByIndex.bind(this);
  }

  deleteTimeByIndex(e) {
    const timeIndex = e.target.getAttribute('data-time-index');
    this.props.deleteTime(parseInt(timeIndex, 10));
  }

  render() {
    const timesList = this.props.sessionTimes.map((time, i) => {
      const displayTime = getDisplayTime(this.props.sessionTimes[i]);
      const newTime = (
        <div key={`time${i + 1}`} className="d-flex justify-content-center">
          <p className="time-number my-0 text-right">{`${i + 1}.`}</p>
          <p className="time-display my-0 text-center">{displayTime}</p>
          <i
            onClick={this.deleteTimeByIndex}
            className="fas fa-times-circle time-delete d-flex align-items-center my-0 text-left"
            data-time-index={i}
          ></i>
        </div>
      );
      return newTime;
    });

    return (
      <div>
        <p>Times</p>
        <div>
          {timesList}
        </div>
      </div>
    );
  }
}
