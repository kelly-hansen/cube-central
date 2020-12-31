import React from 'react';
import Header from '../components/header';
import SignUpForm from '../components/signup-form';
import LogInForm from '../components/login-form';
import AppContext from '../lib/app-context';

export default class LogInSignUpPage extends React.Component {
  render() {
    return (
      <>
        <Header />
        {this.context.route.path === 'login' ? <LogInForm /> : <SignUpForm />}
      </>
    );
  }
}

LogInSignUpPage.contextType = AppContext;
