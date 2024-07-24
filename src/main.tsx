import React from "react";
import ReactDOM from "react-dom/client";

import {SnackbarProvider} from "notistack";
import App2 from "./App2";

import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
         <CssVarsProvider>
            <CssBaseline/>
            <SnackbarProvider maxSnack={5}>
                <DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
                >
                    <App2/>
                </DevSupport>
            </SnackbarProvider>
            </CssVarsProvider>
    </React.StrictMode>
);
