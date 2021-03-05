import React, { useEffect, useState, useRef } from 'react';
import getDisplayTime from '../lib/get-display-time';

export default function Timer(props) {

  const [running, _setRunning] = useState(false);
  const runningRef = useRef(running);
  function setRunning(status) {
    runningRef.current = status;
    _setRunning(status);
  }

  const [elapsed, _setElapsed] = useState(0);
  const elapsedRef = useRef(elapsed);
  function setElapsed(number) {
    elapsedRef.current = number;
    _setElapsed(number);
  }

  const [intervalId, _setIntervalId] = useState(null);
  const intervalIdRef = useRef(intervalId);
  function setIntervalId(id) {
    intervalIdRef.current = id;
    _setIntervalId(id);
  }

  function startTimer() {
    setRunning(true);
    setElapsed(0);
    const newIntervalId = setInterval(() => {
      _setElapsed(prevElapsed => {
        elapsedRef.current = prevElapsed + 10;
        return prevElapsed + 10;
      });
      setIntervalId(newIntervalId);
    }, 10);
  }

  function stopTimer() {
    clearInterval(intervalIdRef.current);
    props.addNewTime(elapsedRef.current);
    setRunning(false);
  }

  function spaceListener(e) {
    if (e.code === 'Space') {
      !runningRef.current ? startTimer() : stopTimer();
      if (e.target === document.body) {
        e.preventDefault();
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', spaceListener);
    return () => {
      window.removeEventListener('keydown', spaceListener);
    };
  }, []);

  const displayedTime = getDisplayTime(elapsed);
  let timerStatusClass;
  running ? timerStatusClass = 'timer-running' : timerStatusClass = 'timer-stopped';

  const fullTimer = (
    <div
    className={`timer ${timerStatusClass} d-flex flex-column justify-content-center align-items-center`}
    onClick={running ? stopTimer : startTimer}
    >
      <p className="counter mb-0">{displayedTime}</p>
      <p className="start-stop">{running ? 'STOP' : 'START'}</p>
    </div>
  );

  return fullTimer;
}
