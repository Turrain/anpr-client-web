import React from "react";
import ReactDOM from "react-dom/client";

import {SnackbarProvider} from "notistack";
import App2 from "./App2";

import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev";

import { CssVarsProvider } from '@mui/joy/styles';

import { BrowserRouter, Router } from "react-router-dom";

import {
    experimental_extendTheme as materialExtendTheme,
    Experimental_CssVarsProvider as MaterialCssVarsProvider,
    THEME_ID as MATERIAL_THEME_ID,
  } from '@mui/material/styles';
  import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/material/CssBaseline';
const materialTheme = materialExtendTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
       <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
       <JoyCssVarsProvider>
       <CssBaseline enableColorScheme />
            <SnackbarProvider maxSnack={5}>
                <DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
                >
                        <BrowserRouter>

                     
                    <App2/>
                    </BrowserRouter>
                </DevSupport>
            </SnackbarProvider>
            </JoyCssVarsProvider>
            </MaterialCssVarsProvider>
    </React.StrictMode>
);
