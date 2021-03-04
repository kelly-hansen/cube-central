import React, { useContext } from 'react';
import Header from '../components/header';
import SignUpForm from '../components/sign-up-form';
import LogInForm from '../components/log-in-form';
import AppContext from '../lib/app-context';

export default function LogInSignUpPage() {
  const context = useContext(AppContext);
  return (
    <>
      <Header />
      {context.route.path === 'log-in' ? <LogInForm /> : <SignUpForm />}
    </>
  );
}
