/** @jsxImportSource @emotion/react */

import * as api from "@/store/api"
import { css } from "@emotion/react"
import { useSelector } from "react-redux"
import { selectSummaryApiArgs } from "@/store/features/labels.slice"
import { RootState } from "@/store/store"
import { ExperienceLabel, IndeedPost } from "@/models"
import { ReactNode } from "react"
import Highlighter from "./highlighter"
import ExperienceForm from "./experience-form"

export default function ExperienceLabeler() {
    const { sample, label, status } = useActiveItem()

    let content: ReactNode
    if (status === "loaded") {
        content = (
            <div>
                <Highlighter sample={sample} label={label}></Highlighter>
                <ExperienceForm sample={sample} label={label}></ExperienceForm>
            </div>
        )
    } else {
        content = (
            <div>
                <pre>{status}</pre>
                <pre>{JSON.stringify(sample, undefined, 2)}</pre>
                <pre>{JSON.stringify(label, undefined, 2)}</pre>
            </div>
        )
    }

    return <div css={styles}>{content}</div>
}

const styles = css({
    display: "flex",
})

type ActiveItem =
    | { sample?: undefined; label?: undefined; status: "loading" }
    | { sample?: undefined; label?: undefined; status: "error" }
    | { sample: Partial<IndeedPost.Model>; label: null; status: "loaded" }
    | { sample: Partial<IndeedPost.Model>; label: Partial<ExperienceLabel.Model>; status: "loaded" }
const useActiveItem = (): ActiveItem => {
    const args = useSelector(selectSummaryApiArgs)

    const summariesQuery = api.useExpLabelSummaryQuery(args)
    if (summariesQuery.isError) return { status: "error" }
    const summaryIdx = useSelector((state: RootState) => state.labels.index)
    const summary = summariesQuery.data?.[summaryIdx]

    const sampleId = summary?.sample.id
    const sampleQuery = api.useSampleQuery(sampleId as string, { skip: !sampleId })
    if (sampleQuery.isError) return { status: "error" }

    const labelId = summary?.label.id
    const labelQuery = api.useExpLabelQuery(labelId as number, { skip: !labelId })
    if (labelQuery.isError) return { status: "error" }

    // When API calls are done...
    if (summariesQuery.isSuccess && sampleQuery.isSuccess) {
        if (!labelId) {
            // No label for this sample
            return {
                sample: sampleQuery.data,
                label: null,
                status: "loaded",
            }
        } else if (labelQuery.isSuccess) {
            // Sample was labeled before
            return {
                sample: sampleQuery.data,
                label: labelQuery.data,
                status: "loaded",
            }
        }
    }

    // Still loading
    return { status: "loading" }
}
