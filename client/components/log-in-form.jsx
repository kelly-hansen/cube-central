import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import AppContext from '../lib/app-context';

export default class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      status: ''
    };
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  handleChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    fetch('/api/auth/log-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
      .then(res => res.json())
      .then(result => {
        if (result.user && result.token) {
          this.context.handleLogIn(result);
        } else {
          this.setState({
            status: result.error
          });
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <Container>
        <Row className="d-flex justify-content-center px-3">
          <Col sm="4" className="form-cont p-4 text-center">
            <h5>Log In</h5>
            <Form
              onSubmit={this.handleSubmit}
              className="text-center"
            >
              <Form.Group controlId="username" className="text-left">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="input"
                  placeholder="Enter username"
                  onChange={this.handleChangeUsername}
                  required
                />
              </Form.Group>
              <Form.Group controlId="password" className="text-left">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  onChange={this.handleChangePassword}
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
            <p className="mt-3 mb-0">{this.state.status}</p>
          </Col>
        </Row>
      </Container>
    );
  }
}

LogInForm.contextType = AppContext;
