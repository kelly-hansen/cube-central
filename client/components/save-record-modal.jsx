import React from 'react';
import { Modal, Form } from 'react-bootstrap';

export default class SaveRecordModal extends React.Component {
  render() {
    return (
      <Modal show={true}>
        <Modal.Header>
          <h3>Save Record</h3>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Puzzle</Form.Label>
              <Form.Control as="select">
                <option>3x3x3 Cube</option>
                <option>2x2x2 Cube</option>
                <option>4x4x4 Cube</option>
                <option>5x5x5 Cube</option>
                <option>3x3x3 One-Handed</option>
                <option>Clock</option>
                <option>Megaminx</option>
                <option>Pyraminx</option>
                <option>Skewb</option>
                <option>Square-1</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}
