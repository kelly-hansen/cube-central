import React from 'react';
import Header from '../components/header';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default class TimerPage extends React.Component {
  render() {
    return (
      <>
        <Header></Header>
        <Container>
          <Row>
            <Col>
            </Col>
            <Col>
              <Button block>Virtual Cube</Button>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}
