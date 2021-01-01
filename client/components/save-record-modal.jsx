import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default class SaveRecordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzleId: null,
      recordTypeId: null
    };
  }

  render() {
    return (
      <Modal show={true}>
        <Modal.Header>
          <h5>Save New Record</h5>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="puzzle">
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
            <Form.Group controlId="record-type">
              <Form.Label>Record Type</Form.Label>
              <Form.Control as="select">
                <option>Single</option>
                <option>Average 3 of 5</option>
              </Form.Control>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="align-self-end">Cancel</Button>
              <Button type="submit" className="ml-2">Submit New Record</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}
