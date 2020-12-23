import React from 'react';

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      elapsedTime: 0
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
  }

  startTimer() {

  }

  stopTimer() {

  }

  render() {
    let timerClass;
    let timerMethod;
    if (this.state.running) {
      timerClass = 'timer timer-running';
      timerMethod = this.stopTimer;
    } else {
      timerClass = 'timer timer-stopped';
      timerMethod = this.startTimer;
    }
    const fullTimer = (
      <div className={timerClass} onClick={timerMethod}>
        <p className="counter">0:00.00</p>
        <p>Start</p>
      </div>
    );
    return fullTimer;
  }
}
