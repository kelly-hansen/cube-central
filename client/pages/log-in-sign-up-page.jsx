import React from 'react';
import Header from '../components/header';
import SignUpForm from '../components/sign-up-form';
import LogInForm from '../components/log-in-form';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

export default function LogInSignUpPage() {
  return (
    <>
      <Header />
      <Router>
        <Switch>
          <Route path="/log-in">
            <LogInForm />
          </Route>
          <Route path="/sign-up">
            <SignUpForm />
          </Route>
        </Switch>
      </Router>
    </>
  );
}
