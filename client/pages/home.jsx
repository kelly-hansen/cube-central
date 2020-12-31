import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import YellowSection from '../components/yellow-section';

export default class Home extends React.Component {
  render() {
    return (
      <>
        <div className="d-flex justify-content-center">
          <Container className="home-btns-cont">
            <Row>
              <Col className="d-flex justify-content-center align-items-center my-4">
                <img
                  src="/cubelogocircle.svg"
                  alt="Logo"
                  className="home-img mr-3"
                />
                <div>
                  <h3 className="title-text mb-0">Speed Cube</h3>
                  <h3 className="title-text mb-0">Timer</h3>
                </div>
              </Col>
            </Row>
            <Row className="py-2">
              <Col className="pr-2">
                <Button
                  className="std-button"
                  variant="warning"
                  block
                >Log In</Button>
              </Col>
              <Col className="pl-2">
                <Button
                className="std-button"
                variant="danger"
                block
              >Sign Up</Button>
              </Col>
            </Row>
            <Row className="py-2">
              <Col>
                <div className="timer-btn d-flex justify-content-center align-items-center">
                  <img
                    src="/stopwatch.svg"
                    alt="Timer"
                    className="timer-btn-icon mr-2"
                  />
                  <h4 className="mb-0">Timer</h4>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
        <YellowSection>
          <div className="d-flex flex-column align-items-center">
            <p className="w-50 font-weight-bold">
              Use the timer to beat your best solve times
            </p>
            <p className="w-50 font-weight-bold">
              Sign up for free to save your records
            </p>
          </div>
        </YellowSection>
      </>
    );
  }
}
