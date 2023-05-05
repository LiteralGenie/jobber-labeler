import styles from "./experience-form.module.scss"
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form"
import { Citation, ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { FormControl, Input, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import AutocompleteChips from "./autocomplete-chips"

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
        <form className={styles.form}>
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
    const { setValue, control } = form

    const citationArray = useFieldArray({
        control: form.control,
        name: `${formPath}.citations` as any,
    })
    const containerEls = useRef<Array<HTMLDivElement | null>>([])

    const onMouseEnter = (item: Citation) =>
        setSelectionState((state) => {
            const { start, end } = item
            return { ...state, secondarySelections: [{ start, end }] }
        })
    const onMouseLeave = () =>
        setSelectionState((state) => {
            return { ...state, secondarySelections: [] }
        })
    const setCitation = (event: FocusEvent, path: string) => {
        event.preventDefault()

        const props = path.split(".")
        const citation = props.reduce((val, prop) => val[prop], form.getValues() as any)
        const start = parseInt(citation.start)
        const end = parseInt(citation.end)
        setSelectionState((state) => ({ ...state, selection: { start, end } }))
    }

    useEffect(() => {
        citationArray.fields.forEach((_, idx) => {
            const containerEl = containerEls.current[idx]
            onSelectionChange(selectionState, containerEl, setValue, `${formPath}.citations.${idx}`)
        })
    }, [selectionState, citationArray, setValue, formPath])

    return (
        <div className={styles.label}>
            <Controller
                name={`${formPath}.category` as any}
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth className="category">
                        <InputLabel>Category</InputLabel>
                        <Select label="Category" {...field}>
                            <MenuItem value={"general"}>General</MenuItem>
                        </Select>
                    </FormControl>
                )}
            />

            <Controller
                name={`${formPath}.conditions` as any}
                control={control}
                render={({ field }) => (
                    <AutocompleteChips
                        label="Conditions"
                        options={["none"]}
                        {...field}
                        className="conditions"
                    />
                )}
            />

            <Controller
                name={`${formPath}.min` as any}
                control={control}
                render={({ field }) => (
                    <TextField
                        label="Min"
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        {...field}
                        className="min"
                    />
                )}
            />

            <Controller
                name={`${formPath}.max` as any}
                control={control}
                render={({ field }) => (
                    <TextField
                        label="Max"
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        {...field}
                        className="max"
                    />
                )}
            />

            <div className="citations">
                <div>Citations</div>
                {citationArray.fields.map((item, idx) => (
                    <div
                        key={item.id}
                        onMouseEnter={() => onMouseEnter(item as any)}
                        onMouseLeave={onMouseLeave}
                        onFocus={(event: any) => setCitation(event, `${formPath}.citations.${idx}`)}
                        onClick={(event: any) => setCitation(event, `${formPath}.citations.${idx}`)}
                        onChange={(event: any) =>
                            setCitation(event, `${formPath}.citations.${idx}`)
                        }
                        ref={(el) => (containerEls.current[idx] = el)}
                        className="citations__inputs"
                    >
                        <Controller
                            name={`${formPath}.citations.${idx}.start` as any}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Start"
                                    type="number"
                                    InputProps={{ inputProps: { min: 0 } }}
                                    {...field}
                                />
                            )}
                        />
                        <Controller
                            name={`${formPath}.citations.${idx}.end` as any}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="End"
                                    type="number"
                                    InputProps={{ inputProps: { min: 0 } }}
                                    {...field}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function onSelectionChange(
    state: SelectionState,
    containerEl: HTMLElement | null,
    setValue: any,
    citationPath: string
): true | undefined {
    if (!state.selection) return
    if (!state.initialFocusEl) return
    if (!containerEl?.contains(state.initialFocusEl)) return

    let { start, end } = state.selection
    if (start > end) [start, end] = [end, start]

    setValue(citationPath, { start, end })
}
