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
import { useForm } from "react-hook-form"

export type ExperienceLabelForm = {
    labels: Array<{
        category: string
        citations: Array<{ start: number; end: number }>
        conditions: string[]
        min: number
        max: number | null
    }>
}

export default function ExperienceLabeler() {
    const { sample, labels, status } = useActiveItem()

    let content: ReactNode
    if (status === "loaded") {
        content = <FormWrapper {...{ sample, labels }} />
    } else {
        content = (
            <div>
                <pre>{status}</pre>
                <pre>{JSON.stringify(sample, undefined, 2)}</pre>
                <pre>{JSON.stringify(labels, undefined, 2)}</pre>
            </div>
        )
    }

    return <div css={styles}>{content}</div>
}

// Init the form when API data is loaded
function FormWrapper({
    sample,
    labels,
}: {
    sample: IndeedPost.Model
    labels: Array<ExperienceLabel.Model>
}) {
    const form = useForm<ExperienceLabelForm>({ defaultValues: { labels } })

    return (
        <div>
            <Highlighter sample={sample} labels={labels} />
            <ExperienceForm {...{ sample, labels, form }} />
        </div>
    )
}

const styles = css({
    display: "flex",
})

type ActiveItem =
    | { sample?: undefined; labels?: undefined; status: "loading" }
    | { sample?: undefined; labels?: undefined; status: "error" }
    | { sample: IndeedPost.Model; labels: []; status: "loaded" }
    | { sample: IndeedPost.Model; labels: ExperienceLabel.Model[]; status: "loaded" }
const useActiveItem = (): ActiveItem => {
    const args = useSelector(selectSummaryApiArgs)

    const summariesQuery = api.useExpLabelSummaryQuery(args)
    if (summariesQuery.isError) return { status: "error" }
    const summaryIdx = useSelector((state: RootState) => state.labels.index)
    const summary = summariesQuery.data?.[summaryIdx]

    const sampleId = summary?.sample.id
    const sampleQuery = api.useSampleQuery(sampleId as string, { skip: !sampleId })
    if (sampleQuery.isError) return { status: "error" }

    const labelIds = summary?.labels.map((lbl) => lbl.id as number)
    console.log("wtf", summary?.labels)
    const labelQuery = api.useExpLabelsQuery(labelIds as number[], { skip: !labelIds })
    if (labelQuery.isError) return { status: "error" }

    // When API calls are done...
    if (summariesQuery.isSuccess && sampleQuery.isSuccess) {
        if (!labelIds) {
            // No label for this sample
            return {
                sample: sampleQuery.data,
                labels: [],
                status: "loaded",
            }
        } else if (labelQuery.isSuccess) {
            // Sample was labeled before
            return {
                sample: sampleQuery.data,
                labels: labelQuery.data,
                status: "loaded",
            }
        }
    }

    // Still loading
    return { status: "loading" }
}
