import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

export default class Header extends React.Component {
  render() {
    return (
    <Navbar expand="md" className="header mb-5">
      <Navbar.Brand>
        <img
          src="/cubelogocircle.svg"
          alt="Logo"
          className="nav-img"
        />
      </Navbar.Brand>
      <Navbar.Brand>Speed Cube Timer</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          <Nav.Link className="text-center" href="#timer">Timer</Nav.Link>
          <Nav.Link className="text-center" href="#world-records">World Records</Nav.Link>
          <Button href="#log-in">Log In/Sign Up</Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );
  }
}
