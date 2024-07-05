import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import App2 from "./App2";
import { ruRU } from "@mui/x-data-grid/locales";
const darkTheme = createTheme(
  {
    palette: {
      mode: "light",
    },
  },
  ruRU
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={5}>
        <App2 />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
