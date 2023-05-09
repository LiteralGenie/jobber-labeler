import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form"
import { Citation, ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { Button, MenuItem, Select } from "@mui/material"
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
    const addCitation = () => {
        citationArray.append({ start: 0, end: 1 })
    }

    useEffect(() => {
        citationArray.fields.forEach((_, idx) => {
            const containerEl = containerEls.current[idx]
            onSelectionChange(selectionState, containerEl, setValue, `${formPath}.citations.${idx}`)
        })
    }, [selectionState, citationArray, setValue, formPath])

    return (
        <div className={styles.label}>
            <div className="field-label">Miscellaneous</div>
            <div className="general">
                <Controller
                    name={`${formPath}.category` as any}
                    control={control}
                    render={({ field }) => (
                        <div className="boxed-input-container category">
                            <div className="boxed-field-label">Category</div>
                            <Select label="Category" {...field}>
                                <MenuItem value={"general"}>General</MenuItem>
                            </Select>
                        </div>
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

                <div className="boxed-input-container">
                    <div className="boxed-field-label">
                        <span>YoE Range</span>
                    </div>
                    <Controller
                        name={`${formPath}.min` as any}
                        control={control}
                        render={({ field }) => (
                            <input
                                type="number"
                                min="0"
                                placeholder="Minimum"
                                {...field}
                                style={{
                                    borderRight: "1px solid #434343",
                                }}
                            ></input>
                        )}
                    />
                    <Controller
                        name={`${formPath}.max` as any}
                        control={control}
                        render={({ field }) => (
                            <input type="number" min="0" placeholder="Maximum" {...field}></input>
                        )}
                    />
                </div>
            </div>

            <div className="citations-container">
                <div className="field-label">Citations</div>
                <div className="citations">
                    {citationArray.fields.map((item, idx) => (
                        <div
                            key={item.id}
                            onMouseEnter={() => onMouseEnter(item as any)}
                            onMouseLeave={onMouseLeave}
                            onFocus={(event: any) =>
                                setCitation(event, `${formPath}.citations.${idx}`)
                            }
                            onClick={(event: any) =>
                                setCitation(event, `${formPath}.citations.${idx}`)
                            }
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
                                    <div className="boxed-input-container">
                                        <div className="boxed-field-label">
                                            <span>Start</span>
                                        </div>
                                        <input
                                            placeholder="Start"
                                            type="number"
                                            min="0"
                                            {...field}
                                        />
                                    </div>
                                )}
                            />
                            <Controller
                                name={`${formPath}.citations.${idx}.end` as any}
                                control={control}
                                render={({ field }) => (
                                    <div className="boxed-input-container">
                                        <div className="boxed-field-label">
                                            <span>Stop</span>
                                        </div>
                                        <input
                                            placeholder="Stop"
                                            type="number"
                                            min="0"
                                            {...field}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="add-citation-container">
                <Button type="button" variant="outlined" onClick={addCitation}>
                    <span className="icon">+</span>
                    <span className="label">Add Citation</span>
                </Button>
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
