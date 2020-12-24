import React from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import YellowSection from '../components/yellow-section';

export default class TimerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sessionTimes: []
    };
    this.addNewTime = this.addNewTime.bind(this);
  }

  addNewTime(time) {
    const sessionTimes = this.state.sessionTimes.slice();
    sessionTimes.push(time);
    this.setState({
      sessionTimes
    });
  }

  render() {
    return (
      <>
        <Header></Header>
        <Container>
          <Row>
            <Col lg className="mb-3">
              <Button className="std-button" block>Virtual Cube</Button>
            </Col>
            <Col lg>
              <Timer></Timer>
            </Col>
          </Row>
        </Container>
        <YellowSection contents="session"></YellowSection>
      </>
    );
  }
}
