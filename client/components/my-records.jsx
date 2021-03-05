import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import getDisplayTime from '../lib/get-display-time';
import AppContext from '../lib/app-context';

export default function MyRecords() {
  const [puzzleType, setPuzzleType] = useState('3x3x3 Cube');
  const [records, setRecords] = useState({
    bestSingle: null,
    bestAverage3Of5Arr: null
  });
  const [status, setStatus] = useState(null);
  const context = useContext(AppContext);

  function handleChange(e) {
    setPuzzleType(e.target.value);
    getRecords(e.target.value);
  }

  function getAverageDisplayTimes(timesArr) {
    const averageObj = {};
    let max;
    let maxIndex;
    let min;
    let minIndex;
    for (let i = 0; i < timesArr.length; i++) {
      if (!max || timesArr[i] > max) {
        max = timesArr[i];
        maxIndex = i;
      }
      if (!min || timesArr[i] < min) {
        min = timesArr[i];
        minIndex = i;
      }
    }
    let sum = 0;
    averageObj.displayTimes = [];
    for (let i = 0; i < timesArr.length; i++) {
      if (i !== maxIndex && i !== minIndex) {
        sum += timesArr[i];
        averageObj.displayTimes.push(getDisplayTime(timesArr[i]));
      } else {
        averageObj.displayTimes.push('(' + getDisplayTime(timesArr[i]) + ')');
      }
    }
    averageObj.displayAverage = getDisplayTime(sum / 3);

    return averageObj;
  }

  function getRecords(puzzleType) {
    setStatus('pending');
    fetch('/api/records', {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': context.token,
        'puzzle-type': puzzleType
      }
    })
      .then(res => res.json())
      .then(result => {
        setRecords(result);
        setStatus(null);
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
      });
  }

  useEffect(() => {
    getRecords(puzzleType);
  }, []);

  let averageTime = 'N/A';
  let averageTimesList = null;

  if (records.bestAverage3Of5Arr) {
    const averageObj = getAverageDisplayTimes(records.bestAverage3Of5Arr);
    averageTime = averageObj.displayAverage;
    averageTimesList = (
      <Row className="justify-content-center">
        {
        averageObj.displayTimes.map((time, ind) => {
          return <Col key={'time' + ind} sm md={2} lg={1} xl={1}>{time}</Col>;
        })
        }
      </Row>
    );
  }

  let contents;
  if (status === 'pending') {
    contents = <Spinner animation="border" variant="primary" />;
  } else if (status === '') {
    contents = false;
  } else if (status === 'error') {
    contents = <p>Unable to retrieve records data at this time. Please try again later.</p>;
  } else {
    contents = (
      <>
        <Row>
          <Col className="d-flex justify-content-center mb-3">
            <p className="stat-col my-0 mr-1 text-right">Single:</p>
            <p className="stat-col my-0 ml-1 text-left">
              {records.bestSingle
                ? getDisplayTime(records.bestSingle[0])
                : 'N/A'}
            </p>
          </Col>
        </Row>
        <Row>
          <Col md className="d-flex justify-content-center mb-3">
            <p className="stat-col my-0 mr-1 text-right">Best Avg 3 Of 5:</p>
            <p className="stat-col my-0 ml-1 text-left">{averageTime}</p>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <Container className="mb-4">
      <Row>
        <Col className="mb-2">
          <p>My Records</p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col className="puzzle-selector  mb-2">
          <Form>
            <Form.Group controlId="puzzleType">
              <Form.Control
                as="select"
                value={puzzleType}
                onChange={handleChange}
              >
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
        </Col>
      </Row>
      {contents}
      {averageTimesList}
    </Container>
  );
}
