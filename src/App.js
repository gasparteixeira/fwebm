import React from "react";
import Home from "./components/Home";
import Header from "./components/Header";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./theme";

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Header />
      <Home />
    </MuiThemeProvider>
  );
}

export default App;
