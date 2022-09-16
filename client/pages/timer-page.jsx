import React, { useContext, useState, useRef } from 'react';
import Header from '../components/header';
import Timer from '../components/timer';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import YellowSection from '../components/yellow-section';
import SessionStats from '../components/session-stats';
import SessionTimes from '../components/session-times';
import SaveRecordModal from '../components/save-record-modal';
import AppContext from '../lib/app-context';
import VirtualCube from '../components/virtual-cube';

export default function TimerPage() {
  const [sessionTimes, _setSessionTimes] = useState([]);
  const sessionTimesRef = useRef(sessionTimes);
  const setSessionTimes = times => {
    sessionTimesRef.current = times;
    _setSessionTimes([]);
  };

  const [sessionRecords, setSessionRecords] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSaveRecordModal, setShowSaveRecordModal] = useState(false);
  const [virtualCube, setVirtualCube] = useState({
    active: false,
    type: 'RubiksCube'
  });

  const context = useContext(AppContext);

  function getSessionRecords(sesTimes) {
    if (sesTimes.length === 0) {
      return null;
    }

    const result = {};
    result.bestSingle = [sesTimes.length > 0 ? Math.min(...sesTimes) : null];

    if (sesTimes.length < 5) {
      result.bestAverage3Of5 = null;
      result.bestAverage3Of5Arr = null;
    } else {
      let bestAvg;
      let bestStartingIndex = 0;
      for (let i = 0; i < sesTimes.length - 4; i++) {
        const sortedSet = sesTimes.slice(i, i + 5).sort((a, b) => a - b);
        const setOf3 = sortedSet.slice(1, 4);
        const avg = setOf3.reduce((acc, cur) => acc + cur) / 3;
        if (bestAvg) {
          if (avg < bestAvg) {
            bestAvg = avg;
            bestStartingIndex = i;
          }
        } else {
          bestAvg = avg;
        }
      }
      result.bestAverage3Of5 = [bestAvg];
      result.bestAverage3Of5Arr = sesTimes.slice(bestStartingIndex, bestStartingIndex + 5);
    }

    return result;
  }

  function addNewTime(time) {
    const sesTimes = sessionTimesRef.current.concat(time);
    const sesRecords = getSessionRecords(sesTimes);
    setSessionTimes(sesTimes);
    setSessionRecords(sesRecords);
  }

  function deleteTime(index) {
    const sesTimes = sessionTimesRef.slice();
    sesTimes.splice(index, 1);
    const sesRecords = getSessionRecords(sesTimes);
    setSessionTimes(sesTimes);
    setSessionRecords(sesRecords);
  }

  function resetSession() {
    setSessionTimes([]);
    setSessionRecords(null);
    setShowResetModal(false);
  }

  function toggleResetModal() {
    setShowResetModal(prev => !prev);
  }

  function toggleSaveRecordModal() {
    setShowSaveRecordModal(prev => !prev);
  }

  function toggleVirtualCube() {
    setVirtualCube(prev => {
      return {
        active: !prev.active,
        type: prev.type
      };
    });
  }

  function changeCubeType() {
    setVirtualCube(prev => {
      return {
        active: prev.active,
        type: prev.type === 'RubiksCube'
          ? 'PocketCube'
          : 'RubiksCube'
      };
    });
  }

  return (
    <>
      <Header />
      <Container>
        <Row className={virtualCube.active ? 'justify-content-center mb-2' : 'justify-content-center mb-3'}>
          {
            !virtualCube.active
              ? (
              <Col md={8} lg={6} xl={6}>
                <Button onClick={toggleVirtualCube} className="std-button" block>Virtual Cube</Button>
              </Col>
                )
              : (
              <>
                <Col md={8} lg={6} xl={6} className="d-flex">
                  <div className="w-50 pr-1">
                    <Button onClick={toggleVirtualCube} className="std-button" block>Hide Cube</Button>
                  </div>
                  <div className="w-50 pl-1">
                    <Button onClick={changeCubeType} className="std-button" block>Change Type</Button>
                  </div>
                </Col>
              </>
                )
          }
        </Row>
        {virtualCube.active && (
          <Row className="justify-content-center mb-4">
            <Col md={8} lg={6} xl={6}>
              <VirtualCube type={virtualCube.type} />
            </Col>
          </Row>
        )}
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={6}>
            <Timer addNewTime={addNewTime} />
          </Col>
        </Row>
      </Container>
      <YellowSection>
        <Container>
          <Row>
            <Col>
              <p>Session</p>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col sm className="d-flex justify-content-center mb-4">
              <SessionStats sessionTimes={sessionTimesRef.current} />
            </Col>
            <Col sm className="d-flex justify-content-center">
              <SessionTimes sessionTimes={sessionTimesRef.current} deleteTime={deleteTime} />
            </Col>
          </Row>
          <Row className="justify-content-center">
            {context.user && <Col md={8} lg className="mt-3">
              <Button onClick={toggleSaveRecordModal} className="std-button" block>Save Record</Button>
            </Col>}
            <Col md={8} lg className="mt-3">
              <Button onClick={toggleResetModal} className="std-button" variant="danger" block>Reset Session</Button>
            </Col>
          </Row>
        </Container>
      </YellowSection>
      <Modal show={showResetModal} onHide={toggleResetModal}>
        <Modal.Body>Are you sure you want to reset the session? All current times will be lost.</Modal.Body>
        <Modal.Footer>
          <Button onClick={toggleResetModal} variant="secondary">Cancel</Button>
          <Button onClick={resetSession} variant="primary">Reset Session</Button>
        </Modal.Footer>
      </Modal>
      <SaveRecordModal
        sessionRecords={sessionRecords}
        toggleSaveRecordModal={toggleSaveRecordModal}
        showModal={showSaveRecordModal}
      />
    </>
  );
}
