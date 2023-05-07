import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form"
import { Citation, ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import AutocompleteChips from "./autocomplete-chips"
import styles from "./label.module.scss"

export type Props = {
    form: UseFormReturn<ExperienceLabelForm>
    formPath: string
    selectionState: SelectionState
    setSelectionState: Dispatch<SetStateAction<SelectionState>>
}

export function Component({ form, formPath, selectionState, setSelectionState }: Props) {
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
