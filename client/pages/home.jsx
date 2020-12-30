import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

export default class Home extends React.Component {
  render() {
    return (
      <Container>
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
        <Row>
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
      </Container>
    );
  }
}
