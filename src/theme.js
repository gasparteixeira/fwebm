import { createMuiTheme } from "@material-ui/core/styles";
const theme = createMuiTheme({
  /* theme for v1.x */
  palette: {
    primary: {
      main: "#bdbdbd"
    },
    secondary: {
      main: "#64b5f6"
    },
    default: {
      main: "#9e9e9e"
    }
  },
  overrides: {
    MuiLinearProgress: {
      root: {
        height: 16,
        color: "white",
        fontSize: 9
      }
    },
    MuiInputBase: {
      root: {
        color: "white"
      }
    },
    MuiInput: {
      underline: {
        "&:hover": {
          borderBottom: "1px solid #bbdefb",
          "&:not($disabled):before": {
            borderBottom: "2px solid #fff"
          }
        },
        "&:before": {
          borderBottom: "1px solid #bbdefb"
        },
        "&:after": {
          borderBottom: "2px solid #fff"
        }
      }
    },
    MuiInputLabel: {
      root: {
        color: "#bbdefb",
        "&$focused": {
          color: "#fff"
        }
      },
      animated: {
        color: "#bbdefb"
      }
    }
  }
});

export default theme;
