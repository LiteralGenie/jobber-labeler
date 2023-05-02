/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Citation, ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { Dispatch, SetStateAction, useEffect } from "react"

export type ExperienceFormProps = {
    form: UseFormReturn<ExperienceLabelForm>
    selectionState: SelectionState
    setSelectionState: Dispatch<SetStateAction<SelectionState>>
}

export default function ExperienceForm({
    form,
    selectionState,
    setSelectionState,
}: ExperienceFormProps) {
    const { control, getValues } = form
    const labelFields = useFieldArray({
        control,
        name: "labels",
    })

    const onSubmit = (data: any) => {
        console.log(data)
        console.log("submit", getValues())
    }
    const onAddLabel = () => {
        labelFields.append({
            category: "general",
            min: 0,
            max: 1,
            conditions: ["aza"],
            citations: [{ start: 0, end: 1 }],
        })
        return false
    }

    return (
        <form css={styles}>
            {labelFields.fields.map((item, idx) => (
                <Label
                    key={item.id}
                    form={form}
                    formPath={`labels.${idx}`}
                    selectionState={selectionState}
                    setSelectionState={setSelectionState}
                ></Label>
            ))}
            <button type="button" onClick={onAddLabel}>
                Add Label
            </button>
            <button type="button" onClick={onSubmit}>
                Submit
            </button>
        </form>
    )
}

function Label({
    form,
    formPath,
    selectionState,
    setSelectionState,
}: {
    form: ExperienceFormProps["form"]
    formPath: string
    selectionState: SelectionState
    setSelectionState: ExperienceFormProps["setSelectionState"]
}) {
    const { setValue } = form
    const register = form.register as any

    const citationArray = useFieldArray({
        control: form.control,
        name: `${formPath}.citations` as any,
    })
    const onMouseEnter = (item: Citation) =>
        setSelectionState((state) => {
            const { start, end } = item
            return { ...state, secondarySelections: [{ start, end }] }
        })
    const onMouseLeave = () =>
        setSelectionState((state) => {
            return { ...state, secondarySelections: [] }
        })
    const onFocus = (event: FocusEvent, path: string) => {
        event.preventDefault()

        const props = path.split(".")
        const citation = props.reduce((val, prop) => val[prop], form.getValues() as any)
        const start = parseInt(citation.start)
        const end = parseInt(citation.end)
        setSelectionState((state) => ({ ...state, selection: { start, end } }))
    }

    useEffect(() => {
        citationArray.fields.forEach((_, idx) => {
            const path = formPath.split(".").concat(["citations", idx.toString()])
            const citation = path.reduce((val, key) => val[key], form.control._fields as any)
            const startEl = citation.start._f.ref
            const endEl = citation.end._f.ref

            onSelectionChange(
                selectionState,
                startEl,
                endEl,
                setValue,
                `${formPath}.citations.${idx}`
            )
        })
    }, [selectionState, citationArray, setValue, formPath])

    return (
        <div>
            <label htmlFor="category">Category</label>
            <input {...register(`${formPath}.category`)} type="text" />

            <label htmlFor="min">Min</label>
            <input {...register(`${formPath}.min`)} type="number" />

            <label htmlFor="max">Max</label>
            <input {...register(`${formPath}.max`)} type="number" />

            <label htmlFor="conditions">Conditions</label>
            <input {...register(`${formPath}.conditions`)} type="text" />

            <div>Citations</div>
            {citationArray.fields.map((item, idx) => (
                <div
                    key={item.id}
                    onMouseEnter={() => onMouseEnter(item as any)}
                    onMouseLeave={onMouseLeave}
                    onFocus={(event) => onFocus(event as any, `${formPath}.citations.${idx}`)}
                    onClick={(event) => onFocus(event as any, `${formPath}.citations.${idx}`)}
                >
                    <input {...register(`${formPath}.citations.${idx}.start`)} type="number" />
                    <input {...register(`${formPath}.citations.${idx}.end`)} type="number" />
                </div>
            ))}
        </div>
    )
}

const styles = css({
    "&": {
        display: "flex",
        flexFlow: "column",
        input: {
            color: "black",
        },
    },
})

function onSelectionChange(
    state: SelectionState,
    startEl: HTMLElement,
    endEl: HTMLElement,
    setValue: any,
    citationPath: string
): true | undefined {
    if (!state.initialFocusEl) return
    if (!state.selection) return
    if (state.initialFocusEl !== startEl && state.initialFocusEl !== endEl) return

    setValue(citationPath, state.selection)
    return true
}
