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
    this.setState({
      running: false,
      elapsed
    });
  }

  getDisplayTime() {
    let time = this.state.elapsed;
    const min = Math.floor(time / 60000);
    time = time - (min * 60000);
    const sec = Math.floor(time / 1000).toString(10);
    time = time - (sec * 1000);
    const hundreths = Math.floor(time / 10).toString(10);
    let displayedSec;
    if (sec.length === 1) {
      displayedSec = '0' + sec;
    } else {
      displayedSec = sec;
    }
    let displayedHundreths;
    if (hundreths.length === 1) {
      displayedHundreths = '0' + hundreths;
    } else {
      displayedHundreths = hundreths;
    }
    const displayedTime = `${min}:${displayedSec}.${displayedHundreths}`;

    return displayedTime;
  }

  render() {
    const displayedTime = this.getDisplayTime();

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
