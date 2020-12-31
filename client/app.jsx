import React from 'react';
import Home from './pages/home';
import Profile from './pages/profile';
import TimerPage from './pages/timer-page';
import LogInSignUpPage from './pages/log-in-sign-up-page';
import parseRoute from './lib/parse-route';
import AppContext from './lib/app-context';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      route: parseRoute(window.location.hash)
    };
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
  }

  handleLogIn(result) {
    const { user, token } = result;
    window.localStorage.setItem('speed-cube-timer-jwt', token);
    this.setState({
      user
    });
    const url = new URL(window.location);
    url.hash = '#';
    window.location.replace(url);
  }

  handleLogOut() {

  }

  componentDidMount() {
    window.addEventListener('hashchange', () => {
      this.setState({
        route: parseRoute(window.location.hash)
      });
    });
  }

  renderPage() {
    const { route } = this.state;
    if (route.path === '') {
      return this.state.user === null ? <Home /> : <Profile />;
    } else if (route.path === 'timer') {
      return <TimerPage />;
    } else if (route.path === 'log-in' || route.path === 'sign-up') {
      return <LogInSignUpPage />;
    }
  }

  render() {
    const contextValue = {
      user: this.state.user,
      route: this.state.route,
      handleLogIn: this.handleLogIn
    };
    return (
      <AppContext.Provider value={contextValue}>
        {this.renderPage()}
      </AppContext.Provider>
    );
  }
}
