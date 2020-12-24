import React from 'react';

export default class YellowSection extends React.Component {
  render() {
    let contents;
    if (this.props.contents === 'session') {
      contents = (
        <>
          <p>Session</p>
          <div className="session-data">
            <div>

            </div>
            <div>
              <ol>
                <li>1:25.02</li>
                <li>1:04.43</li>
              </ol>
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
