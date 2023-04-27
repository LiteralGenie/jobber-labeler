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
    | { sample: undefined; label: undefined; isLoading: true }
    | { sample: Partial<IndeedPost.Model>; label: null; isLoading: false }
    | { sample: Partial<IndeedPost.Model>; label: Partial<ExperienceLabel.Model>; isLoading: false }
const useActiveItem = (): ActiveItem => {
    const args = useSelector(selectSummaryApiArgs)

    const summariesQuery = api.useExpLabelSummaryQuery(args)
    const summaryIdx = useSelector((state: RootState) => state.labelIndex.index)
    const summary = summariesQuery.data?.[summaryIdx]

    const sampleId = summary?.sample.id
    const sampleQuery = api.useSampleQuery(sampleId as string, { skip: !sampleId })

    const labelId = summary?.label.id
    const labelQuery = api.useExpLabelQuery(labelId as number, { skip: !labelId })

    if (!summariesQuery.isLoading && !sampleQuery.isLoading) {
        if (!labelId) {
            // No label yet for this sample
            return {
                sample: sampleQuery.data as Partial<IndeedPost.Model>,
                label: null,
                isLoading: false,
            }
        } else if (labelId && !labelQuery.isLoading) {
            // Sample and label exist
            return {
                sample: sampleQuery.data as Partial<IndeedPost.Model>,
                label: labelQuery.data as Partial<ExperienceLabel.Model>,
                isLoading: false,
            }
        }
    }

    // Still loading
    return {
        sample: undefined,
        label: undefined,
        isLoading: true,
    }
}
