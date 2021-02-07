import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

class App extends Component {
  render() {
    return <h1>React MobX Common Lib Test</h1>
  }
}


ReactDOM.render(
  EASY_ENV_IS_DEV ? <AppContainer><App /></AppContainer> : <App />,
  document.getElementById('app')
);
if (module.hot) {
  module.hot.accept();
}
