/** @jsxImportSource @emotion/react */

import * as api from "@/store/api"
import { css } from "@emotion/react"
import { useSelector } from "react-redux"
import { selectSummaryApiArgs } from "@/store/features/label-index.slice"
import { RootState } from "@/store/store"
import { ExperienceLabel, IndeedPost } from "@/models"

export default function ExperienceLabeler() {
    const { sample, label, isLoading } = useActiveItem()

    return (
        <div css={styles}>
            {/* {sampleId && (
                <div>
                    <Highlighter summary={labelResult!.data[sampleId]}></Highlighter>
                    <ExperienceForm></ExperienceForm>
                </div>
            )} */}
            <div>
                <pre>{isLoading}</pre>
                <pre>{JSON.stringify(sample, undefined, 2)}</pre>
                <pre>{JSON.stringify(label, undefined, 2)}</pre>
            </div>
        </div>
    )
}

const styles = css({
    display: "flex",
})

type ActiveItem =
    | { status: "loading" }
    | { status: "error" }
    | { sample: Partial<IndeedPost.Model>; label: null; status: "loaded" }
    | { sample: Partial<IndeedPost.Model>; label: Partial<ExperienceLabel.Model>; status: "loaded" }
const useActiveItem = (): ActiveItem => {
    const args = useSelector(selectSummaryApiArgs)

    const summariesQuery = api.useExpLabelSummaryQuery(args)
    if (summariesQuery.isError) return { status: "error" }
    const summaryIdx = useSelector((state: RootState) => state.labelIndex.index)
    const summary = summariesQuery.data?.[summaryIdx]

    const sampleId = summary?.sample.id
    const sampleQuery = api.useSampleQuery(sampleId as string, { skip: !sampleId })
    if (sampleQuery.isError) return { status: "error" }

    const labelId = summary?.label.id
    const labelQuery = api.useExpLabelQuery(labelId as number, { skip: !labelId })
    if (labelQuery.isError) return { status: "error" }

    if (summariesQuery.isSuccess && sampleQuery.isSuccess) {
        if (!labelId) {
            // No label yet for this sample
            return {
                sample: sampleQuery.data,
                label: null,
                status: "loaded",
            }
        } else if (labelQuery.isSuccess) {
            // Sample and label exist
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
