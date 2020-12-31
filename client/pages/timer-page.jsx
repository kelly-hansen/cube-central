import React from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import YellowSection from '../components/yellow-section';
import SessionStats from '../components/session-stats';
import SessionTimes from '../components/session-times';
import AppContext from '../lib/app-context';

export default class TimerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionTimes: [],
      bestSingle: null,
      bestAverage3Of5: null,
      showResetModal: false
    };
    this.getSessionRecords = this.getSessionRecords.bind(this);
    this.addNewTime = this.addNewTime.bind(this);
    this.deleteTime = this.deleteTime.bind(this);
    this.toggleResetModal = this.toggleResetModal.bind(this);
    this.resetSession = this.resetSession.bind(this);
  }

  getSessionRecords() {
    const result = {};
    result.bestSingle = [this.state.sessionTimes.length > 0 ? Math.min(...this.state.sessionTimes) : null];

    let bestAvg;
    let bestStartingIndex = 0;
    if (this.state.sessionTimes.length < 5) {
      bestAvg = null;
      bestStartingIndex = null;
    } else {
      for (let i = 0; i < this.state.sessionTimes.length - 4; i++) {
        const sortedSet = this.state.sessionTimes.slice(i, i + 5).sort((a, b) => a - b);
        const setOf3 = sortedSet.slice(1, 4);
        const avg = setOf3.reduce((acc, cur) => acc + cur) / 3;
        if (bestAvg) {
          if (avg < bestAvg) {
            bestAvg = avg;
            bestStartingIndex = i;
          }
        } else {
          bestAvg = avg;
        }
      }
    }

    result.bestAvg3Of5 = bestAvg;
    result.bestAvg3Of5Arr = this.state.sessionTimes.slice(bestStartingIndex, bestStartingIndex + 5);

    return result;
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

  toggleResetModal() {
    this.setState({
      showResetModal: !this.state.showResetModal
    });
  }

  resetSession() {
    this.setState({
      sessionTimes: [],
      showResetModal: false
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
            <Row className="mb-4">
              <Col sm className="d-flex justify-content-center mb-4">
                <SessionStats sessionTimes={this.state.sessionTimes} />
              </Col>
              <Col sm className="d-flex justify-content-center">
                <SessionTimes sessionTimes={this.state.sessionTimes} deleteTime={this.deleteTime} />
              </Col>
            </Row>
            <Row>
              {this.context.user && <Col lg className="mt-3">
                <Button className="std-button" block>Save Record</Button>
              </Col>}
              <Col lg className="mt-3">
                <Button onClick={this.toggleResetModal} className="std-button" variant="danger" block>Reset Session</Button>
              </Col>
            </Row>
          </Container>
        </YellowSection>
        <Modal show={this.state.showResetModal} onHide={this.toggleResetModal}>
          <Modal.Body>Are you sure you want to reset the session? All current times will be lost.</Modal.Body>
          <Modal.Footer>
            <Button onClick={this.toggleResetModal} variant="secondary">Cancel</Button>
            <Button onClick={this.resetSession} variant="primary">Reset Session</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

TimerPage.contextType = AppContext;
