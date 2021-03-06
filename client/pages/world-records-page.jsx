import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { Table, Spinner } from 'react-bootstrap';
import YellowSection from '../components/yellow-section';

export default function WorldRecordsPage() {

  const [recordsData, setRecordsData] = useState(null);
  const [dateUpdated, setDateUpdated] = useState(null);

  useEffect(() => {
    fetch('/api/world-records')
      .then(res => res.json())
      .then(result => {
        if (result.recordsData) {
          setRecordsData(result.recordsData);
          setDateUpdated(result.dateUpdated);
        } else {
          setRecordsData('error');
        }
      })
      .catch(err => {
        console.error(err);
        setRecordsData('error');
      });
  }, []);

  let contents;
  if (recordsData === null) {
    contents = (
      <Spinner animation="border" variant="primary" />
    );
  } else if (recordsData === 'error') {
    contents = (
      <p className="text-center">Unable to retrieve records data at this time. Please try again later.</p>
    );
  } else {
    contents = (
      <div className="world-records-cont">
        {
          recordsData.map((puzzle, puzzleInd) => {
            return (
              <div key={'puzzle' + puzzleInd}>
                <h5 className="ml-1">{puzzle.puzzle}</h5>
                <Table striped size="sm" className="mb-4">
                  <thead>
                    <tr>
                      <th className="table-col-25">Type</th>
                      <th className="table-col-50">Name</th>
                      <th className="table-col-25">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      puzzle.rows.map((row, rowInd) => {
                        return (
                          <tr key={`puzzle ${puzzleInd} row ${rowInd}`}>
                            <td>{row.type}</td>
                            <td>{row.name}</td>
                            <td>{row.result}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </Table>
              </div>
            );
          })
        }
      </div>
    );
  }

  return (
    <>
      <Header />
      <h5 className="text-center">World Records</h5>
      <p className="text-center font-weight-bold mb-4">via World Cube Association (WCA)</p>
      <div className="d-flex justify-content-center">
        {contents}
      </div>
      <YellowSection>
        {dateUpdated && <p className="text-center mt-4">{`Last Updated: ${new Date(dateUpdated).toLocaleDateString()}`}</p>}
      </YellowSection>
    </>
  );
}
