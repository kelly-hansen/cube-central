import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

export default class Header extends React.Component {
  render() {
    return (
    <Navbar expand="md" className="header">
      <Navbar.Brand>
        <img
          src="/cubelogocircle.svg"
          alt="Logo"
          className="nav-img"
        />
      </Navbar.Brand>
      <Navbar.Brand>Speed Cube Timer</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav>
          <Nav.Link href="#login">Log In/Sign Up</Nav.Link>
          <Nav.Link href="#timer">Timer</Nav.Link>
          <Nav.Link href="#world-records">World Records</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );
  }
}
