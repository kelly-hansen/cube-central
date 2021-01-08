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
                  <h3 className="title-text mb-0">Cube</h3>
                  <h3 className="title-text mb-0">Central</h3>
                </div>
              </Col>
            </Row>
            <Row className="py-2">
              <Col className="pr-2">
                <Button
                  href="#log-in"
                  className="std-button d-flex justify-content-center align-items-center"
                  variant="warning"
                  block
                >Log In</Button>
              </Col>
              <Col className="pl-2">
                <Button
                  href="#sign-up"
                  className="std-button d-flex justify-content-center align-items-center"
                  variant="danger"
                  block
                >Sign Up</Button>
              </Col>
            </Row>
            <Row className="py-2">
              <Col>
                <Button
                  href="#timer"
                  variant="success"
                  className="timer-btn d-flex justify-content-center align-items-center">
                  <img
                    src="/stopwatch.svg"
                    alt="Timer"
                    className="timer-btn-icon mr-2"
                  />
                  <h4 className="mb-0">Solve</h4>
                </Button>
              </Col>
            </Row>
            <Row className="py-2">
              <Col>
                <Button
                  href="#world-records"
                  className="timer-btn d-flex justify-content-center align-items-center">
                  <img
                    src="/globe.svg"
                    alt="Glove"
                    className="timer-btn-icon mr-2"
                  />
                  <h4 className="mb-0">World Records</h4>
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
        <YellowSection>
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            <p className="home-info-text w-50 font-weight-bold">
              Use the timer to beat your best solve times
            </p>
            <p className="home-info-text w-50 font-weight-bold">
              Sign up for free to save your records
            </p>
          </div>
        </YellowSection>
      </>
    );
  }
}
