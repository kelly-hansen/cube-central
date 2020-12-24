import React from 'react';

export default class YellowSection extends React.Component {
  render() {
    let contents;
    if (this.props.contents === 'session') {
      contents = (
        <>
          <p>Session</p>
          <div className="session-data">
            <div className="session-stats">
              <div>
                <p>Best:</p>
                <p>1:04.43</p>
              </div>
              <div>
                <p>Worst:</p>
                <p>1:58.97</p>
              </div>
              <div></div>
            </div>
            <div className="session-times">
              <p>Times</p>
              <div className="times-list">
                <div>
                  <p>1.</p>
                  <p>1:25.02</p>
                  <p>X</p>
                </div>
                <div>
                  <p>2.</p>
                  <p>1:04.43</p>
                  <p>X</p>
                </div>
              </div>
            </div>
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
