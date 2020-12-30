import React from 'react';
import TimerPage from './pages/timer-page';
import LogInSignUp from './pages/login-signup';
import parseRoute from './lib/parse-route';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    if (route.path === '' || route.path === 'timer') {
      return <TimerPage />;
    }
    if (route.path === 'signup') {
      return <LogInSignUp />;
    }
  }

  render() {
    return this.renderPage();
  }
}
