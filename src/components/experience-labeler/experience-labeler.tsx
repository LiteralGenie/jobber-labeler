/** @jsxImportSource @emotion/react */

import * as api from "@/store/api"
import { css } from "@emotion/react"
import Highlighter from "./highlighter"
import ExperienceForm from "./experience-form"
import { useState } from "react"

export default function ExperienceLabeler() {
    const labelResult = api.useExpLabelSummaryQuery()
    const [sampleId, setSampleId] = useState<string | undefined | null>(
        undefined
    )

    // Init sampleId
    if (!labelResult.isLoading && sampleId == undefined) {
        const firstSampleId = Object.keys(labelResult.data || {})[0]
        console.log("set first", firstSampleId)
        setSampleId(firstSampleId || null)
    }

    return (
        <div css={styles}>
            {sampleId && (
                <div>
                    <Highlighter
                        summary={labelResult!.data[sampleId]}
                    ></Highlighter>
                    <ExperienceForm></ExperienceForm>
                </div>
            )}
            <pre>{JSON.stringify(labelResult.data, undefined, 2)}</pre>
        </div>
    )
}

const styles = css({
    display: "flex",
})
