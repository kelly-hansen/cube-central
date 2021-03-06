import React, { useContext } from 'react';
import Header from '../components/header';
import YellowSection from '../components/yellow-section';
import MyRecords from '../components/my-records';
import AppContext from '../lib/app-context';

export default function Profile() {
  const context = useContext(AppContext);

  const joinDate = new Date(context.user.joinDate);

  return (
    <>
      <Header />
      <div className="d-flex justify-content-center align-items-center my-4">
        <img
          src="/cubelogoiconbw.svg"
          alt="Cube Icon"
          className="profile-cube-icon mr-3"
        />
        <h5 className="mb-0">{context.user.username}</h5>
      </div>
      <div className="d-flex flex-column align-items-center">
        <p className="mb-1">Member Since:</p>
        <p>{joinDate.toLocaleDateString()}</p>
      </div>
      <YellowSection>
        <MyRecords />
      </YellowSection>
    </>
  );
}
