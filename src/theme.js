import { createMuiTheme } from "@material-ui/core/styles";
const theme = createMuiTheme({
  /* theme for v1.x */
  palette: {
    primary: {
      light: "#6d6d6d",
      main: "#424242",
      dark: "#1b1b1b",
      contrastText: "#fff"
    },
    secondary: {
      light: "#819ca9",
      main: "#546e7a",
      dark: "#29434e",
      contrastText: "#fff"
    }
  },
  overrides: {}
});

export default theme;
