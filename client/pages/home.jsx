import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import YellowSection from '../components/yellow-section';
import { Link } from 'react-router-dom';

export default function Home() {
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
              <Link to="/log-in" className="std-button btn-warning d-flex justify-content-center align-items-center rounded">
                Log In
              </Link>
            </Col>
            <Col className="pl-2">
              <Link to="sign-up" className="std-button btn-danger d-flex justify-content-center align-items-center rounded">
                Sign Up
              </Link>
            </Col>
          </Row>
          <Row className="py-2">
            <Col>
              <Link to="/timer" className="timer-btn d-flex justify-content-center align-items-center rounded">
                <img
                  src="/stopwatch.svg"
                  alt="Timer"
                  className="timer-btn-icon mr-2"
                />
                <h4 className="mb-0">Solve</h4>
              </Link>
            </Col>
          </Row>
          <Row className="py-2">
            <Col>
              <Link to="/world-records" className="timer-btn btn-primary d-flex justify-content-center align-items-center rounded">
                <img
                  src="/globe.svg"
                  alt="Glove"
                  className="timer-btn-icon mr-2"
                />
                <h4 className="mb-0">World Records</h4>
              </Link>
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
