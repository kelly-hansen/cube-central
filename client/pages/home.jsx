import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

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
      </Container>
    );
  }
}
