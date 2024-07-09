import React from "react";
import ReactDOM from "react-dom/client";
import {ThemeProvider, createTheme} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {SnackbarProvider} from "notistack";
import App2 from "./App2";
import {ruRU} from "@mui/x-data-grid/locales";
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

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
            <CssBaseline/>
            <SnackbarProvider maxSnack={5}>
                <DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
                >
                    <App2/>
                </DevSupport>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
);
