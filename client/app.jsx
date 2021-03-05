import React, { useState, useEffect } from 'react';
import Home from './pages/home';
import Profile from './pages/profile';
import TimerPage from './pages/timer-page';
import WorldRecordsPage from './pages/world-records-page';
import LogInSignUpPage from './pages/log-in-sign-up-page';
import parseRoute from './lib/parse-route';
import AppContext from './lib/app-context';
import decodeToken from './lib/decode-token';

export default function App() {

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [route, setRoute] = useState(parseRoute(window.location.hash));

  function handleLogIn(result) {
    window.localStorage.setItem('speed-cube-timer-jwt', result.token);
    setUser(result.user);
    setToken(result.token);
    const url = new URL(window.location);
    url.hash = '#';
    window.location.replace(url);
  }

  function handleLogOut() {
    window.localStorage.removeItem('speed-cube-timer-jwt');
    setUser(null);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    window.addEventListener('hashchange', () => {
      setRoute(parseRoute(window.location.hash));
    });
    const storedToken = window.localStorage.getItem('speed-cube-timer-jwt');
    setUser(storedToken ? decodeToken(storedToken) : null);
    setToken(storedToken);
  }, []);

  function renderPage() {
    if (route.path === '') {
      return user === null ? <Home /> : <Profile />;
    } else if (route.path === 'timer') {
      return <TimerPage />;
    } else if (route.path === 'log-in' || route.path === 'sign-up') {
      return <LogInSignUpPage />;
    } else if (route.path === 'world-records') {
      return <WorldRecordsPage />;
    }
  }

  const contextValue = {
    user,
    token,
    route,
    handleLogIn,
    handleLogOut
  };
  return (
    <AppContext.Provider value={contextValue}>
      {renderPage()}
    </AppContext.Provider>
  );
}
