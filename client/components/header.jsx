import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import AppContext from '../lib/app-context';
export default class Header extends React.Component {
  render() {
    return (
    <Navbar expand="md" className="header mb-5">
      <Navbar.Brand href="#">
        <img
          src="/cubelogocircle.svg"
          alt="Logo"
          className="nav-img"
        />
      </Navbar.Brand>
      <Navbar.Brand href="#">Speed Cube Timer</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav>
          {this.context.user && <Nav.Link className="text-center" disabled>{`Welcome, ${this.context.user.username}!`}</Nav.Link>}
          {this.context.user && <Nav.Link className="text-center" href="#">Profile</Nav.Link>}
          <Nav.Link className="text-center" href="#timer">Timer</Nav.Link>
          <Nav.Link className="text-center" href="#world-records">World Records</Nav.Link>
          {this.context.user === null ? <Button href="#log-in">Log In/Sign Up</Button> : <Button onClick={this.context.handleLogOut}>Log Out</Button>}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );
  }
}

Header.contextType = AppContext;
