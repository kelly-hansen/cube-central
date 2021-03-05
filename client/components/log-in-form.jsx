import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default function LogInForm(props) {
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
    const credentials = {
      username,
      password
    };
    try {
      const response = await fetch('/api/auth/log-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      const result = await response.json();
      if (result.user && result.token) {
        context.handleLogIn(result);
      } else {
        setStatus(result.error);
      }
    } catch (err) {
      setStatus('Unable to process request at this time');
      console.error(err);
    }
  }

  return (
    <Container>
      <Row className="d-flex justify-content-center px-3">
        <Col sm="4" className="form-cont p-4 text-center">
          <h5>Log In</h5>
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
            </Form.Group>
            <div className="my-3">
              <a href="#sign-up">Don&apos;t have an account? Sign up now.</a>
            </div>
            <Button variant="primary" type="submit">
              Log In
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
