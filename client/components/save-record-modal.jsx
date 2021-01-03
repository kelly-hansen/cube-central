import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import getDisplayTime from '../lib/get-display-time';

export default class SaveRecordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      puzzle: '3x3x3 Cube',
      recordType: 'Single'
    };
    this.updatePuzzle = this.updatePuzzle.bind(this);
    this.updateRecordType = this.updateRecordType.bind(this);
    this.saveNewRecord = this.saveNewRecord.bind(this);
  }

  updatePuzzle(e) {
    this.setState({
      puzzle: e.target.value
    });
  }

  updateRecordType(e) {
    this.setState({
      recordType: e.target.value
    });
  }

  saveNewRecord(e) {
    e.preventDefault();
    const body = Object.assign({}, this.state);
    body.solves = body.recordType === 'Single' ? this.props.sessionRecords.bestSingle : this.props.sessionRecords.bestAverage3Of5Arr;
  }

  render() {
    let displayedRecord;
    let submitDisabled;
    if (this.props.sessionRecords === null) {
      displayedRecord = 'No session time to display';
      submitDisabled = true;
    } else if (this.state.recordType === 'Single') {
      displayedRecord = getDisplayTime(this.props.sessionRecords.bestSingle);
      submitDisabled = false;
    } else if (this.state.recordType === 'Average 3 of 5') {
      if (this.props.sessionRecords.bestAverage3Of5 === null) {
        displayedRecord = 'Need at least 5 times in session';
        submitDisabled = true;
      } else {
        displayedRecord = getDisplayTime(this.props.sessionRecords.bestAverage3Of5);
        submitDisabled = false;
      }
    }

    return (
      <Modal show={this.props.showModal} onHide={this.props.toggleSaveRecordModal}>
        <Modal.Header>
          <h5 className="mb-0">New Record</h5>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={this.saveNewRecord}>
            <Form.Group controlId="puzzle">
              <Form.Label>Puzzle</Form.Label>
              <Form.Control as="select" value={this.state.puzzle} onChange={this.updatePuzzle}>
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
              <Form.Control as="select" value={this.state.recordType} onChange={this.updateRecordType}>
                <option>Single</option>
                <option>Average 3 of 5</option>
              </Form.Control>
            </Form.Group>
            <p className="text-center my-5">{displayedRecord}</p>
            <div className="d-flex justify-content-center">
              <Button onClick={this.props.toggleSaveRecordModal} variant="secondary" className="align-self-end">Cancel</Button>
              <Button type="submit" className="ml-2" disabled={submitDisabled}>Submit New Record</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}
