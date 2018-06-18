import React from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Raven from 'raven-js';

import MainPage from '../MainPage';
// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#730007',
      main: '#730007',
      dark: '#730007',
    },
    secondary: {
      light: '#730007',
      main: '#730007',
      dark: '#730007',
    },
  },
});

class App extends React.Component {
  render() {
    Raven.config(
      'https://c185eda6089740c5904068dfc02ccbe8@sentry.io/1223712'
    ).install();

    return (
      <MuiThemeProvider theme={theme}>
        <MainPage {...this.props} />
      </MuiThemeProvider>
    );
  }
}

export default App;
