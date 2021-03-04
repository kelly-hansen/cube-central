import React, { useState, useContext } from 'react';
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

  handleLogIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('speed-cube-timer-jwt', token);
    this.setState({
      user,
      token
    });
    const url = new URL(window.location);
    url.hash = '#';
    window.location.replace(url);
  }

  handleLogOut() {
    window.localStorage.removeItem('speed-cube-timer-jwt');
    this.setState({
      user: null
    });
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
    const token = window.localStorage.getItem('speed-cube-timer-jwt');
    const user = token ? decodeToken(token) : null;
    this.setState({ user, token });
  }

  renderPage() {
    const { route } = this.state;
    if (route.path === '') {
      return this.state.user === null ? <Home /> : <Profile />;
    } else if (route.path === 'timer') {
      return <TimerPage />;
    } else if (route.path === 'log-in' || route.path === 'sign-up') {
      return <LogInSignUpPage />;
    } else if (route.path === 'world-records') {
      return <WorldRecordsPage />;
    }
  }

  render() {
    const contextValue = {
      user: this.state.user,
      token: this.state.token,
      route: this.state.route,
      handleLogIn: this.handleLogIn,
      handleLogOut: this.handleLogOut
    };
    return (
      <AppContext.Provider value={contextValue}>
        {this.renderPage()}
      </AppContext.Provider>
    );
  }
}
