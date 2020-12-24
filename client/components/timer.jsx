import React from 'react';
import getDisplayTime from '../lib/get-display-time';

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
    let elapsed = 0;
    const intervalId = setInterval(() => {
      elapsed = elapsed + 10;
      this.setState({
        intervalId,
        running: true,
        elapsed
      });
    }, 10);
  }

  stopTimer() {
    clearInterval(this.state.intervalId);
    const elapsed = this.state.elapsed;
    this.props.addNewTime(elapsed);
    this.setState({
      running: false,
      elapsed
    });
  }

  render() {
    const displayedTime = getDisplayTime(this.state.elapsed);

    const fullTimer = (
      <div
      className={this.state.running ? 'timer timer-running' : 'timer timer-stopped'}
      onClick={this.state.running ? this.stopTimer : this.startTimer}
      >
        <p className="counter">{displayedTime}</p>
        <p className="start-stop">{this.state.running ? 'STOP' : 'START'}</p>
      </div>
    );

    return fullTimer;
  }
}
