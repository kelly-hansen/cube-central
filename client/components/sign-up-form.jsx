import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import AppContext from '../lib/app-context';
import { Link } from 'react-router-dom';

export default function SignUpForm() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const context = useContext(AppContext);

  function handleChangeUsername(e) {
    setUsername(e.target.value);
  }

  function handleChangePassword(e) {
    setPassword(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('pending');
    const body = {
      username,
      password
    };
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      let newStatus;
      if (data.error) {
        newStatus = data.error;
      } else {
        const logInResponse = await fetch('/api/auth/log-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        const result = await logInResponse.json();
        if (result.user && result.token) {
          context.handleLogIn(result);
        } else {
          setStatus(result.error);
        }
      }
      setStatus(newStatus);
      e.target.reset();
    } catch (err) {
      setStatus('Unable to process request at this time');
      console.error(err);
    }
  }

  return (
    <Container>
      <Row className="d-flex justify-content-center px-3">
        <Col sm="4" className="form-cont p-4 text-center">
          <h5>Sign Up</h5>
          <Form
            onSubmit={handleSubmit}
            className="text-center"
          >
            <Form.Group controlId="username" className="text-left">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="input"
                placeholder="Enter username"
                onChange={handleChangeUsername}
                required
              />
            </Form.Group>
            <Form.Group controlId="password" className="text-left">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                onChange={handleChangePassword}
                required
              />
              <Form.Text muted>
                Password must be at least 8 characters long.
              </Form.Text>
            </Form.Group>
            <div className="my-3">
              <Link to="/log-in">Already have an account? Click here to log in.</Link>
            </div>
            <Button variant="primary" type="submit">
              Sign Up
            </Button>
          </Form>
          <div className="mt-3 mb-0">
            {
              status === 'pending'
                ? <Spinner animation="border" variant="primary" />
                : status
            }
          </div>
        </Col>
      </Row>
    </Container>
  );
}
