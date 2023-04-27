/** @jsxImportSource @emotion/react */

import * as api from "@/store/api"
import { css } from "@emotion/react"
import { useSelector } from "react-redux"
import { selectSummaryApiArgs } from "@/store/features/label-index.slice"
import { RootState } from "@/store/store"

export default function ExperienceLabeler() {
    const { label, isLoading } = useActiveLabel()

    return (
        <div css={styles}>
            {/* {sampleId && (
                <div>
                    <Highlighter summary={labelResult!.data[sampleId]}></Highlighter>
                    <ExperienceForm></ExperienceForm>
                </div>
            )} */}
            <pre>{JSON.stringify(label, undefined, 2)}</pre>
        </div>
    )
}

const styles = css({
    display: "flex",
})

const useActiveLabel = () => {
    const args = useSelector(selectSummaryApiArgs)
    const summariesQuery = api.useExpLabelSummaryQuery(args)
    const summaryIdx = useSelector((state: RootState) => state.labelIndex.index)
    const labelId = summariesQuery.data?.[summaryIdx].label.id as number
    const labelQuery = api.useExpLabelQuery(labelId, { skip: !labelId })

    return {
        label: labelQuery.data,
        isLoading: summariesQuery.isLoading || labelQuery.isLoading,
    }
}
