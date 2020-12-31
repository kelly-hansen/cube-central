import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

export default class SignUpForm extends React.Component {
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
    fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state)
    })
      .then(res => res.json())
      .then(data => {
        let status;
        if (data.error) {
          status = data.error;
        } else {
          status = `Welcome ${data.username}! Your account has been created.`;
        }
        this.setState({
          status
        });
      })
      .catch(err => console.error(err));
  }

  render() {
    return (
      <Container>
        <Row className="d-flex justify-content-center px-3">
          <Col sm="4" className="form-cont p-4 text-center">
            <h5>Sign Up</h5>
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
                <Form.Text muted>
                  Password must be at least 8 characters long.
                </Form.Text>
              </Form.Group>
              <div className="my-3">
                <a href="#log-in">Already have an account? Click here to log in.</a>
              </div>
              <Button variant="primary" type="submit">
                Sign Up
              </Button>
            </Form>
            <p className="mt-3 mb-0">{this.state.status}</p>
          </Col>
        </Row>
      </Container>
    );
  }
}
