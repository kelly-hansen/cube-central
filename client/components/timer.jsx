import React from 'react';

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const fullTimer = (
      <div className="timer timer-stopped">
        <p className="counter">0:00.00</p>
        <p>Start</p>
      </div>
    );
    return fullTimer;
  }
}
