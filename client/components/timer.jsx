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

  componentDidUpdate() {
    setTimeout(() => {
      if (this.state.running) {
        this.setState({
          running: true,
          elapsed: this.state.elapsed + 10
        });
      }
    }, 10);
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
        <p className="counter">{this.state.elapsed}</p>
        <p className="start-stop">{this.state.running ? 'STOP' : 'START'}</p>
      </div>
    );
    return fullTimer;
  }
}
