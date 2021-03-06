import React, { useContext, useState } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import getDisplayTime from '../lib/get-display-time';
import AppContext from '../lib/app-context';

export default function SaveRecordModal(props) {
  const [puzzleType, setPuzzleType] = useState('3x3x3 Cube');
  const [recordType, setRecordType] = useState('Single');
  const [status, setStatus] = useState(null);
  const context = useContext(AppContext);

  function updatePuzzle(e) {
    setPuzzleType(e.target.value);
  }

  function updateRecordType(e) {
    setRecordType(e.target.value);
  }

  async function saveNewRecord(e) {
    e.preventDefault();
    setStatus('pending');
    const body = {
      puzzleType,
      recordType
    };
    body.solves = body.recordType === 'Single' ? props.sessionRecords.bestSingle : props.sessionRecords.bestAverage3Of5Arr;
    try {
      await fetch('/api/new-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': context.token
        },
        body: JSON.stringify(body)
      });
      setStatus('Record saved!');
    } catch (err) {
      console.error(err);
      setStatus('Unable to process request at this time.');
    }
  }

  function closeAndResetModal() {
    props.toggleSaveRecordModal();
    setStatus(null);
  }

  let modalContents;
  if (status === 'pending') {
    modalContents = (
      <Modal.Body className="d-flex justify-content-center">
        <Spinner animation="border" variant="primary" />
      </Modal.Body>
    );
  } else if (status !== null) {
    modalContents = (
      <>
        <Modal.Body>
          <p className="text-center my-3">{status}</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button onClick={closeAndResetModal}>Close</Button>
        </Modal.Footer>
      </>
    );
  } else {
    let displayedRecord;
    let submitDisabled;
    if (props.sessionRecords === null) {
      displayedRecord = 'No session time to display';
      submitDisabled = true;
    } else if (recordType === 'Single') {
      displayedRecord = getDisplayTime(props.sessionRecords.bestSingle);
      submitDisabled = false;
    } else if (recordType === 'Average 3 of 5') {
      if (props.sessionRecords.bestAverage3Of5 === null) {
        displayedRecord = 'Need at least 5 times in session';
        submitDisabled = true;
      } else {
        displayedRecord = getDisplayTime(props.sessionRecords.bestAverage3Of5);
        submitDisabled = false;
      }
    }

    modalContents = (
      <>
        <Modal.Header>
          <h5 className="mb-0">New Record</h5>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={saveNewRecord}>
            <Form.Group controlId="puzzle">
              <Form.Label>Puzzle</Form.Label>
              <Form.Control as="select" value={puzzleType} onChange={updatePuzzle}>
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
              <Form.Control as="select" value={recordType} onChange={updateRecordType}>
                <option>Single</option>
                <option>Average 3 of 5</option>
              </Form.Control>
            </Form.Group>
            <p className="text-center my-5">{displayedRecord}</p>
            <div className="d-flex justify-content-center">
              <Button onClick={props.toggleSaveRecordModal} variant="secondary" className="align-self-end">Cancel</Button>
              <Button type="submit" className="ml-2" disabled={submitDisabled}>Submit New Record</Button>
            </div>
          </Form>
        </Modal.Body>
      </>
    );
  }

  return (
    <Modal show={props.showModal} onHide={closeAndResetModal}>
      {modalContents}
    </Modal>
  );
}
