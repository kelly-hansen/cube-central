import React from 'react';
import Home from './pages/home';
import Profile from './pages/profile';
import TimerPage from './pages/timer-page';
import LogInSignUpPage from './pages/login-signup-page';
import parseRoute from './lib/parse-route';
import AppContext from './lib/app-context';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      route: parseRoute(window.location.hash)
    };
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
      return <Profile />;
    } else if (route.path === 'timer') {
      return <TimerPage />;
    } else if (route.path === 'login' || route.path === 'signup') {
      return <LogInSignUpPage />;
    }
  }

  render() {
    const contextValue = {
      user: this.state.user,
      route: this.state.route
    };
    return (
      <AppContext.Provider value={contextValue}>
        this.renderPage();
      </AppContext.Provider>
    );
  }
}
