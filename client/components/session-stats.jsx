import React from 'react';

export default class SessionStats extends React.Component {
  render() {
    return (
      <div className="session-stats">
        <div className="d-flex justify-content-center mx-3">
          <p className="stat-col my-0 mr-1 text-right">Best:</p>
          <p className="stat-col my-0 ml-1 text-left">1:04.43</p>
        </div>
        <div className="d-flex justify-content-center mx-3">
          <p className="stat-col my-0 mr-1 text-right">Worst:</p>
          <p className="stat-col my-0 ml-1 text-left">1:58.97</p>
        </div>
      </div>
    );
  }
}
