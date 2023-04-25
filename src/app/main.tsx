/** @jsxImportSource @emotion/react */
"use client"

import ExperienceLabeler from "@/components/experience-labeler/experience-labeler"
import Sidebar from "@/components/sidebar/sidebar"
import { css } from "@emotion/react"

export default function MainComponent() {
    return (
        <div css={contentContainerStyles}>
            <Sidebar></Sidebar>
            <main css={contentStyles}>
                <ExperienceLabeler></ExperienceLabeler>
            </main>
        </div>
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
