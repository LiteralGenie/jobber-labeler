import styles from "./experience-form.module.scss"
import * as api from "@/store/api"
import { useSelector } from "react-redux"
import { selectSummaryApiArgs } from "@/store/features/labels.slice"
import { RootState } from "@/store/store"
import { ExperienceLabel, IndeedPost } from "@/models"
import { ReactNode, useState } from "react"
import Highlighter from "./highlighter"
import ExperienceForm from "./experience-form"
import { useForm } from "react-hook-form"

export type Citation = { start: number; end: number }

export type ExperienceLabelForm = {
    labels: Array<{
        category: string
        citations: Citation[]
        conditions: string[]
        min: number
        max: number | null
    }>
}

export type SelectionState = {
    // Text that's highlighted
    selection: Citation | null
    // Text outlined with dotted box (for minor emphasis)
    secondarySelections: Citation[]
    // Input that was focused when the user started highlighting
    initialFocusEl: Element | null
}

export default function ExperienceLabeler() {
    // Load API data
    const { sample, labels, status } = useActiveItem()

    // Init the form when API data loaded
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
    return <div>{content}</div>
}

function FormWrapper({
    sample,
    labels,
}: {
    sample: IndeedPost.Model
    labels: Array<ExperienceLabel.Model>
}) {
    const defaultLabels = [
        { category: "general", min: 0, conditions: [], citations: [{ start: 0, end: 0 }] },
    ]
    const defaultValues = labels.length ? { labels } : { labels: defaultLabels }
    const form = useForm<ExperienceLabelForm>({ defaultValues })

    const [selectionState, setSelectionState] = useState<SelectionState>({
        selection: null,
        secondarySelections: [],
        initialFocusEl: null,
    })

    return (
        <div className={styles.container}>
            <ExperienceForm {...{ form, selectionState, setSelectionState }} />
            <Highlighter {...{ sample, selectionState, setSelectionState }} />
        </div>
    )
}

type ActiveItem =
    | { sample?: undefined; labels?: undefined; status: "loading" }
    | { sample?: undefined; labels?: undefined; status: "error" }
    | { sample: IndeedPost.Model; labels: []; status: "loaded" }
    | { sample: IndeedPost.Model; labels: ExperienceLabel.Model[]; status: "loaded" }
const useActiveItem = (): ActiveItem => {
    const args = useSelector(selectSummaryApiArgs)

    const summariesQuery = api.useExpLabelSummaryQuery(args)
    const summaryIdx = useSelector((state: RootState) => state.labels.index)
    const summary = summariesQuery.data?.[summaryIdx]

    const sampleId = summary?.sample.id
    const sampleQuery = api.useSampleQuery(sampleId as string, { skip: !sampleId })

    const labelIds = summary?.labels.map((lbl) => lbl.id as number)
    const labelQuery = api.useExpLabelsQuery(labelIds as number[], { skip: !labelIds })

    if (summariesQuery.isError) return { status: "error" }
    if (sampleQuery.isError) return { status: "error" }
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
