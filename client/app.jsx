import React, { useState, useEffect } from 'react';
import Home from './pages/home';
import Profile from './pages/profile';
import TimerPage from './pages/timer-page';
import WorldRecordsPage from './pages/world-records-page';
import LogInSignUpPage from './pages/log-in-sign-up-page';
import parseRoute from './lib/parse-route';
import AppContext from './lib/app-context';
import decodeToken from './lib/decode-token';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

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

  const contextValue = {
    user,
    token,
    route,
    handleLogIn,
    handleLogOut
  };
  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <Switch>
          <Route exact path="/">
            {user === null ? <Home /> : <Profile />}
          </Route>
          <Route path="/timer">
            <TimerPage />
          </Route>
          <Route path={['/log-in', '/sign-up']}>
            <LogInSignUpPage />
          </Route>
          <Route path="/world-records">
            <WorldRecordsPage />
          </Route>
        </Switch>
      </Router>
    </AppContext.Provider>
  );
}
