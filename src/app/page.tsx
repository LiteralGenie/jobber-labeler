/** @jsxImportSource @emotion/react */
"use client"

import Sidebar from "@/components/sidebar/sidebar"
import { STORE } from "@/store/store"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { Provider } from "react-redux"
import { THEME } from "./theme"
import { css } from "@emotion/react"
import ExperienceLabeler from "@/components/experience-labeler/experience-labeler"

export default function Home() {
    return (
        <Provider store={STORE}>
            <ThemeProvider theme={THEME}>
                <CssBaseline />
                <div css={contentContainerStyles}>
                    <Sidebar></Sidebar>
                    <main css={contentStyles}>
                        <ExperienceLabeler></ExperienceLabeler>
                    </main>
                </div>
            </ThemeProvider>
        </Provider>
    )
}

const contentStyles = css({
    "&": {
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "calc(10px + 2vmin)",
        color: "white",
    },
})

const contentContainerStyles = css({
    "&": {
        height: "100vh",
        display: "flex",
        flexFlow: "row",
        textAlign: "center",
    },
})
