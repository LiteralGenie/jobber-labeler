/** @jsxImportSource @emotion/react */

import * as api from "@/store/api"
import { css } from "@emotion/react"
import Highlighter from "./highlighter"
import ExperienceForm from "./experience-form"

export default function ExperienceLabeler() {
    const { data: labelSummaries } = api.useExpLabelSummaryQuery()
    return (
        <div css={styles}>
            <pre>{JSON.stringify(labelSummaries, undefined, 2)}</pre>
            <Highlighter></Highlighter>
            <ExperienceForm></ExperienceForm>
        </div>
    )
}

const styles = css({
    display: "flex",
})
