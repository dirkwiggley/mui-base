import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(210, 180, 140, 1.0)",
      light: "rgba(217, 189, 176, 1.0)",
    },
    secondary: {
      // main: "#3BACB6",
      main: "rgba(255,255,255,1.0)",
      light: "#82DBD8"
    },
    info: {
      main: "rgba(255,255,255,1.0)",
      light: "rgba(0,0,0,1.0)",
    },
  },
  typography: {
    fontFamily: [
      'DM Serif Text',
      'serif',
    ].join(','),
  },
});

export const otherColors = {
    // background: {
    //   medium: "#3BACB6",
    //   light: "#82DBD8",
      // darkestBlue: "#2155CD",
      primaryMain: "rgba(210, 180, 140, 1.0)",
      primaryLight: "rgba(217, 189, 176, 1.0)",
      darkestBlue: "#D2B48C",
    //   darkerBlue: "#0AA1DD",
    //   lightBlue: "#79DAE8",
    //   lightestBlue: "#E8F9FD",
    //   white: "#FFFFFF",
    //   lightGray: "#EEEEEE",
    // },
}
