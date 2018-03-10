import React from "react";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import Reboot from "material-ui/Reboot";

import MainPage from "../MainPage";
// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#730007",
      main: "#730007",
      dark: "#730007"
    },
    secondary: {
      light: "#730007",
      main: "#730007",
      dark: "#730007"
    }
  }
});

class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {/* Reboot kickstart an elegant, consistent, and simple baseline to build upon. */}
        <Reboot />
        <MainPage {...this.props} />
      </MuiThemeProvider>
    );
  }
}

export default App;
