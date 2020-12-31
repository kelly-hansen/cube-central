import React from 'react';
import Header from '../components/header';
import YellowSection from '../components/yellow-section';

export default class Profile extends React.Component {
  render() {
    return (
      <>
        <Header />
        <div className="d-flex justify-content-center align-items-center my-4">
          <img
            src="/cubelogoiconbw.svg"
            alt="Cube Icon"
            className="profile-cube-icon mr-3"
          />
          <h5 className="mb-0">Username</h5>
        </div>
        <div className="d-flex flex-column align-items-center">
          <p className="mb-1">Member Since:</p>
          <p>joinDate</p>
        </div>
        <YellowSection></YellowSection>
      </>
    );
  }
}
