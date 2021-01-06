import React from 'react';
import Header from '../components/header';
import { Table, Spinner } from 'react-bootstrap';

export default class WorldRecordsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dateUpdated: null,
      recordsData: null
    };
  }

  componentDidMount() {
    fetch('/api/world-records')
      .then(res => res.json())
      .then(result => {
        console.log(result.recordsData);
        if (result.recordsData) {
          this.setState({
            dateUpdated: result.dateUpdated,
            recordsData: result.recordsData
          });
        } else {
          this.setState({
            recordsData: 'error'
          });
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    let contents;
    if (this.state.recordsData === null) {
      contents = (
        <Spinner animation="border" variant="primary" />
      );
    } else if (this.state.recordsData === 'error') {
      contents = (
        <p>Unable to retrieve records data at this time. Please try again later.</p>
      );
    } else {
      contents = (
        <div className="world-records-cont">
            <h5 className="ml-1">3x3x3 Cube</h5>
            <Table striped size="sm" className="mb-4">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Single</td>
                  <td>Yusheng Du</td>
                  <td>3.47</td>
                </tr>
                <tr>
                  <td>Average</td>
                  <td>Feliks Zemdegs</td>
                  <td>5.53</td>
                </tr>
              </tbody>
            </Table>
            <h5 className="ml-1">3x3x3 Cube</h5>
            <Table striped size="sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Single</td>
                  <td>Yusheng Du</td>
                  <td>3.47</td>
                </tr>
                <tr>
                  <td>Average</td>
                  <td>Feliks Zemdegs</td>
                  <td>5.53</td>
                </tr>
              </tbody>
            </Table>
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
        {this.state.dateUpdated && <p className="text-center mt-4">Last Updated: 1/5/2021</p>}
      </>
    );
  }
}
