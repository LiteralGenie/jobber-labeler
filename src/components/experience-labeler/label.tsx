import { Dispatch, SetStateAction, useRef } from "react"
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form"
import {
    ExperienceLabelForm,
    ActiveSelectionState,
    CitationPath,
    HighlightState,
} from "./experience-labeler"
import { Button, IconButton, MenuItem, Select } from "@mui/material"
import AutocompleteChips from "./autocomplete-chips"
import styles from "./label.module.scss"
import CloseIcon from "@mui/icons-material/Close"

export type Props = {
    form: UseFormReturn<ExperienceLabelForm>
    formPath: `labels.${number}`
    activeSelectionState: ActiveSelectionState
    activeCitationPath: CitationPath | null
    setActiveCitationPath: Dispatch<SetStateAction<CitationPath | null>>
    setHighlightState: Dispatch<SetStateAction<HighlightState>>
}

export function Component({
    form,
    formPath,
    activeSelectionState,
    activeCitationPath,
    setActiveCitationPath,
    setHighlightState,
}: Props) {
    const { control } = form

    const citationArray = useFieldArray({
        control: form.control,
        name: `${formPath}.citations` as any,
    })
    const containerEls = useRef<Array<HTMLDivElement | null>>([])

    // When a citation is focused, highlight the corresponding text in <Highlighter />
    const setHighlight = (type: "focus" | "hover", path: CitationPath) => {
        setHighlightState((state) => ({
            ...state,
            [type]: path,
        }))
    }
    const clearHighlights = (type: "focus" | "hover") => {
        setHighlightState((state) => ({
            ...state,
            [type]: null,
        }))
    }

    // Add / delete citations
    const addCitation = () => {
        citationArray.append({ start: 0, end: 1 })
    }
    const onDeleteCitation = (idx: number) => {
        citationArray.remove(idx)
    }

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
                            onMouseEnter={() =>
                                setHighlight("hover", `${formPath}.citations.${idx}`)
                            }
                            onMouseLeave={() => {
                                clearHighlights("hover")
                            }}
                            onFocus={() => {
                                setHighlight("focus", `${formPath}.citations.${idx}`)
                                setActiveCitationPath(`${formPath}.citations.${idx}`)
                            }}
                            onBlur={() => {
                                clearHighlights("focus")
                                if (false === activeSelectionState.isSelecting)
                                    setActiveCitationPath(null)
                            }}
                            onChange={() => setHighlight("focus", `${formPath}.citations.${idx}`)}
                            ref={(el) => (containerEls.current[idx] = el)}
                            className="citations__row"
                        >
                            <div className="citations__inputs">
                                <Controller
                                    name={`${formPath}.citations.${idx}.start` as any}
                                    control={control}
                                    render={({ field }) => (
                                        <div
                                            className={[
                                                "boxed-input-container",
                                                // Show focus indicator while user is making a selection
                                                activeCitationPath ===
                                                    `${formPath}.citations.${idx}` &&
                                                activeSelectionState.isSelecting
                                                    ? "focused"
                                                    : "",
                                            ].join(" ")}
                                        >
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
                                        <div
                                            className={[
                                                "boxed-input-container",
                                                // Show focus indicator while user is making a selection
                                                activeCitationPath ===
                                                    `${formPath}.citations.${idx}` &&
                                                activeSelectionState.isSelecting
                                                    ? "focused"
                                                    : "",
                                            ].join(" ")}
                                        >
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

                            <div>
                                <IconButton
                                    className={idx === 0 ? "disabled" : ""}
                                    onClick={() => onDeleteCitation(idx)}
                                >
                                    <CloseIcon className={"delete"} />
                                </IconButton>
                            </div>
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
