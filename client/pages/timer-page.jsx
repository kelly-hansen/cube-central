import React from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import YellowSection from '../components/yellow-section';

export default class TimerPage extends React.Component {
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
        <YellowSection title="Session">
          <Container>
            <Row>
              <Col></Col>
              <Col></Col>
            </Row>
          </Container>
        </YellowSection>
      </>
    );
  }
}
