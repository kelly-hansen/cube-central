import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
// import Button from 'react-bootstrap/Button';
import AppContext from '../lib/app-context';

export default function Header() {
  const {
    user
    // handleLogOut
  } = useContext(AppContext);
  const goHome = eventKey => (eventKey === '#') && (window.location.hash = '#');

  return (
  <Navbar expand="md" className="header mb-5" collapseOnSelect onSelect={goHome}>
    <Navbar.Brand href="#">
      <img
        src="/cubelogocircle.svg"
        alt="Logo"
        className="nav-img"
      />
    </Navbar.Brand>
    <Navbar.Brand href="#">Cube Central</Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Nav>
        {user && <Nav.Link className="text-center" disabled>{`Welcome, ${user.username}!`}</Nav.Link>}
        {user && <Nav.Link className="text-center" href="#">Profile</Nav.Link>}
        {/* <Nav.Link className="text-center" href="#timer">Timer</Nav.Link> */}
        {/* <Nav.Link className="text-center" href="#world-records">World Records</Nav.Link> */}
        {/* {user === null ? <Button href="#log-in">Log In/Sign Up</Button> : <Button onClick={handleLogOut}>Log Out</Button>} */}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
  );
}
