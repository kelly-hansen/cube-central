import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

export default class SignUpForm extends React.Component {
  render() {
    return (
      <Container>
        <Row className="d-flex justify-content-center px-3">
          <Col sm="4" className="form-cont p-4 text-center">
            <h5>Sign Up</h5>
            <Form className="text-center">
              <Form.Group controlId="username" className="text-left">
                <Form.Label>Username</Form.Label>
                <Form.Control type="input" placeholder="Enter username" />
              </Form.Group>
              <Form.Group controlId="password" className="text-left">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Sign Up
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}
