import React from 'react';
import SessionTimes from './session-times';

export default class YellowSection extends React.Component {
  render() {
    let contents;
    if (this.props.contents === 'session') {
      contents = (
        <>
          <p>Session</p>
          <div className="session-data d-flex">
            <div className="session-stats">
              <div className="d-flex justify-content-center">
                <p>Best:</p>
                <p>1:04.43</p>
              </div>
              <div className="d-flex justify-content-center">
                <p>Worst:</p>
                <p>1:58.97</p>
              </div>
              <div></div>
            </div>
            <SessionTimes sessionTimes={this.props.sessionTimes} />
          </div>
        </>
      );
    }

    const fullYellowSection = (
      <div className="yellow-container">
        <div className="yellow-round-top">
          <div className="yellow-contents">
            {contents}
          </div>
        </div>
      </div>
    );

    return fullYellowSection;
  }
}
