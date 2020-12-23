import React from 'react';

export default class YellowSection extends React.Component {
  render() {
    const fullYellowSection = (
      <div className="yellow-container">
        <div className="round-top">{this.props.title}</div>
      </div>
    );

    return fullYellowSection;
  }
}
