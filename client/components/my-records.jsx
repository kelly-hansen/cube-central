import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';

export default class MyRecords extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzletype: '3x3x3 Cube',
      records: {
        bestSingle: null,
        bestAverage3Of5Arr: 7
      }
    };
  }

  render() {
    const averageTimes = this.state.records.bestAverage3Of5Arr
      ? (
      <Row>
        <Col className="d-flex justify-content-center">
          <Col className="mx-2">0:35.53</Col>
          <Col className="mx-2">0:35.53</Col>
          <Col className="mx-2">0:35.53</Col>
          <Col className="mx-2">0:35.53</Col>
          <Col className="mx-2">0:35.53</Col>
        </Col>
      </Row>
        )
      : null;

    return (
      <Container className="mb-4">
        <Row>
          <Col className="mb-2">
            <p>My Records</p>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col className="puzzle-selector  mb-2">
            <Form>
              <Form.Group controlId="puzzleType">
                <Form.Control as="select">
                  <option>3x3x3 Cube</option>
                  <option>2x2x2 Cube</option>
                  <option>4x4x4 Cube</option>
                  <option>5x5x5 Cube</option>
                  <option>3x3x3 One-Handed</option>
                  <option>Clock</option>
                  <option>Megaminx</option>
                  <option>Pyraminx</option>
                  <option>Skewb</option>
                  <option>Square-1</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col className="d-flex justify-content-center mb-3">
            <p className="stat-col my-0 mr-1 text-right">Single:</p>
            <p className="stat-col my-0 ml-1 text-left">N/A</p>
          </Col>
        </Row>
        <Row>
          <Col md className="d-flex justify-content-center mb-3">
            <p className="stat-col my-0 mr-1 text-right">Best Avg 3 Of 5:</p>
            <p className="stat-col my-0 ml-1 text-left">N/A</p>
          </Col>
        </Row>
        {averageTimes}
      </Container>
    );
  }
}
