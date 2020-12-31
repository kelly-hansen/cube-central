import React from 'react';
import Header from '../components/header';
import SignUpForm from '../components/sign-up-form';
import LogInForm from '../components/log-in-form';
import AppContext from '../lib/app-context';

export default class LogInSignUpPage extends React.Component {
  render() {
    return (
      <>
        <Header />
        {this.context.route.path === 'log-in' ? <LogInForm /> : <SignUpForm />}
      </>
    );
  }
}

LogInSignUpPage.contextType = AppContext;
