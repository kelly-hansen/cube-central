import React from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import YellowSection from '../components/yellow-section';
import SessionTimes from '../components/session-times';

export default class TimerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionTimes: []
    };
    this.addNewTime = this.addNewTime.bind(this);
  }

  addNewTime(time) {
    const sessionTimes = this.state.sessionTimes.concat(time);
    this.setState({
      sessionTimes
    });
  }

  render() {
    return (
      <>
        <Header />
        <Container>
          <Row>
            <Col lg className="mb-3">
              <Button className="std-button" block>Virtual Cube</Button>
            </Col>
            <Col lg>
              <Timer addNewTime={this.addNewTime} />
            </Col>
          </Row>
        </Container>
        <YellowSection>
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
            </div>
            <SessionTimes sessionTimes={this.state.sessionTimes} />
          </div>
        </YellowSection>
      </>
    );
  }
}
