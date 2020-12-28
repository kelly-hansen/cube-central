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
              <div className="d-flex justify-content-center mx-3">
                <p className="stat-col my-0 mr-1 text-right">Best:</p>
                <p className="stat-col my-0 ml-1 text-left">1:04.43</p>
              </div>
              <div className="d-flex justify-content-center mx-3">
                <p className="stat-col my-0 mr-1 text-right">Worst:</p>
                <p className="stat-col my-0 ml-1 text-left">1:58.97</p>
              </div>
              <div></div>
            </div>
            <SessionTimes sessionTimes={this.props.sessionTimes} />
          </div>
        </>
      );
    }

    const fullYellowSection = (
      <div className="pt-5 mt-auto mb-0 mx-0 overflow-hidden">
        <div className="yellow-round-top position-relative pt-5 d-flex justify-content-center overflow-hidden text-center">
          <div className="yellow-contents mb-5">
            {contents}
          </div>
        </div>
      </div>
    );

    return fullYellowSection;
  }
}
