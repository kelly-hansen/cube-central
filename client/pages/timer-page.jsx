import React from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import YellowSection from '../components/yellow-section';
import SessionStats from '../components/session-stats';
import SessionTimes from '../components/session-times';

export default class TimerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionTimes: []
    };
    this.addNewTime = this.addNewTime.bind(this);
    this.deleteTime = this.deleteTime.bind(this);
  }

  addNewTime(time) {
    const sessionTimes = this.state.sessionTimes.concat(time);
    this.setState({
      sessionTimes
    });
  }

  deleteTime(index) {

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
            <SessionStats sessionTimes={this.state.sessionTimes} />
            <SessionTimes sessionTimes={this.state.sessionTimes} />
          </div>
        </YellowSection>
      </>
    );
  }
}
