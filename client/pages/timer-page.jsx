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
    const newSessionTimes = this.state.sessionTimes.slice();
    newSessionTimes.splice(index, 1);
    this.setState({
      sessionTimes: newSessionTimes
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
          <Container>
            <Row>
              <Col>
                <p>Session</p>
              </Col>
            </Row>
            <Row className="mb-5">
              <Col sm className="d-flex justify-content-center mb-4">
                <SessionStats sessionTimes={this.state.sessionTimes} />
              </Col>
              <Col sm className="d-flex justify-content-center">
                <SessionTimes sessionTimes={this.state.sessionTimes} deleteTime={this.deleteTime} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Button className="std-button" variant="danger" block>Reset Session</Button>
              </Col>
            </Row>
          </Container>
        </YellowSection>
      </>
    );
  }
}
