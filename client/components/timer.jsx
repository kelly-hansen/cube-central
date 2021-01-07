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
    this.spaceListener = this.spaceListener.bind(this);
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

  spaceListener(e) {
    if (e.code === 'Space') {
      !this.state.running ? this.startTimer() : this.stopTimer();
      if (e.target === document.body) {
        e.preventDefault();
      }
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.spaceListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.spaceListener);
  }

  render() {
    const displayedTime = getDisplayTime(this.state.elapsed);
    let timerStatusClass;
    this.state.running ? timerStatusClass = 'timer-running' : timerStatusClass = 'timer-stopped';

    const fullTimer = (
      <div
      className={`timer ${timerStatusClass} d-flex flex-column justify-content-center align-items-center`}
      onClick={this.state.running ? this.stopTimer : this.startTimer}
      >
        <p className="counter mb-0">{displayedTime}</p>
        <p className="start-stop">{this.state.running ? 'STOP' : 'START'}</p>
      </div>
    );

    return fullTimer;
  }
}
