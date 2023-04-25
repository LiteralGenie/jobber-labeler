/** @jsxImportSource @emotion/react */
"use client"

import { STORE } from "@/store/store"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { Provider } from "react-redux"
import { THEME } from "./theme"
import MainComponent from "./main"

export default function Home() {
    return (
        <Provider store={STORE}>
            <ThemeProvider theme={THEME}>
                <CssBaseline />
                <MainComponent></MainComponent>
            </ThemeProvider>
        </Provider>
    )
}
