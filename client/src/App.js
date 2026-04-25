// @ts-nocheck
import React, { Component } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';

// Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';

//Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './store/actions';

import theme from './theme';
import { Alert } from './components';
import { pageCursors } from './utils';
import Routes from './Routes';

import './assets/scss/index.scss';
import 'typeface-montserrat';
import { CssBaseline } from '@material-ui/core';

// Masukkan Client ID kamu di sini
const clientId = "487627412650-pitvqjk6oq85n5oj7t4hgrb4lq7n5f86.apps.googleusercontent.com";

class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser());
    pageCursors();
  }
  
  render() {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Alert />
            <Routes />
            <div className="cursor" id="cursor" />
            <div className="cursor2" id="cursor2" />
            <div className="cursor3" id="cursor3" />
          </ThemeProvider>
        </Provider>
      </GoogleOAuthProvider>
    );
  }
}

export default App;