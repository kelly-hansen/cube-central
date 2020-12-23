import React from 'react';

export default class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
      elapsed: 0
    };
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
  }

  startTimer() {
    this.setState({
      running: true,
      elapsed: 0
    });
  }

  stopTimer() {
    const elapsed = this.state.elapsed;
    this.setState({
      running: false,
      elapsed
    });
  }

  render() {
    let timerClass;
    if (this.state.running) {
      timerClass = 'timer timer-running';
    } else {
      timerClass = 'timer timer-stopped';
    }
    const fullTimer = (
      <div className={timerClass} onClick={this.state.running ? this.stopTimer : this.startTimer}>
        <p className="counter">0:00.00</p>
        <p>Start</p>
      </div>
    );
    return fullTimer;
  }
}
