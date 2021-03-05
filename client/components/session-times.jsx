import React from 'react';
import getDisplayTime from '../lib/get-display-time';

export default function SessionTimes(props) {

  function deleteTimeByIndex(e) {
    const timeIndex = e.target.getAttribute('data-time-index');
    props.deleteTime(parseInt(timeIndex, 10));
  }

  const timesList = props.sessionTimes.map((time, i) => {
    const displayTime = getDisplayTime(props.sessionTimes[i]);
    const newTime = (
      <div key={`time${i + 1}`} className="d-flex justify-content-center">
        <p className="time-number my-0 text-right">{`${i + 1}.`}</p>
        <p className="time-display my-0 text-center">{displayTime}</p>
        <i
          onClick={deleteTimeByIndex}
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
