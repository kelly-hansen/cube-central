import React from 'react';
import Header from '../components/header';
import SignUpForm from '../components/signup-form';

export default class LogInSignUpPage extends React.Component {
  render() {
    return (
      <>
        <Header />
        <SignUpForm />
      </>
    );
  }
}
