import React from 'react';

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      elapsedTime: 0
    };
  }

  render() {
    let timerClass;
    if (this.state.running) {
      timerClass = 'timer timer-running';
    } else {
      timerClass = 'timer timer-stopped';
    }
    const fullTimer = (
      <div className={timerClass}>
        <p className="counter">0:00.00</p>
        <p>Start</p>
      </div>
    );
    return fullTimer;
  }
}
