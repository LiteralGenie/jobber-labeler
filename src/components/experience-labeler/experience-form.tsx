import styles from "./experience-form.module.scss"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import {
    ExperienceLabelForm,
    ActiveSelectionState,
    CitationPath,
    HighlightState,
} from "./experience-labeler"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    IconButton,
} from "@mui/material"
import { toTitleCase } from "@/utils"
import * as Label from "./label"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DeleteIcon from "@mui/icons-material/Delete"

export type ExperienceFormProps = {
    form: UseFormReturn<ExperienceLabelForm>
    activeSelectionState: ActiveSelectionState
    activeCitationPath: CitationPath | null
    setActiveCitationPath: Dispatch<SetStateAction<CitationPath | null>>
    setHighlightState: Dispatch<SetStateAction<HighlightState>>
}

export default function ExperienceForm({
    form,
    activeSelectionState,
    activeCitationPath,
    setActiveCitationPath,
    setHighlightState,
}: ExperienceFormProps) {
    const { control, getValues } = form
    const labelFields = useFieldArray({
        control,
        name: "labels",
    })

    const containerRef = useRef<HTMLFormElement>(null)

    const onSubmit = (data: any) => {
        console.log(data)
        console.log("submit", getValues())
    }
    const onAddLabel = () => {
        // Create new accordion
        labelFields.append({
            category: "general",
            min: 0,
            max: 1,
            conditions: [],
            citations: [{ start: 0, end: 1 }],
        })

        // Open new accordion but avoid showing both closing animation (on old panel) and opening animation (on new panel)
        disableClosingAnimation(openPanel)
        onAccordionToggle(true, labelFields.fields.length)
    }

    const onDeleteLabel = (idx: number) => {
        if (openPanel === idx) {
            setOpenPanel(null)
        } else if (openPanel !== null && openPanel > idx) {
            setOpenPanel(openPanel - 1)
        }

        labelFields.remove(idx)
    }

    const [openPanel, setOpenPanel] = useState(0 as number | null)
    const onAccordionToggle = (isExpanded: boolean, idx: number) => {
        setOpenPanel(isExpanded ? idx : null)
    }

    const getLabelSummary = (idx: number) => {
        const d = getValues(`labels.${idx}`)
        const minStr = d.min === undefined ? "?" : d.min
        const maxStr = d.max === undefined ? "?" : d.max
        return `${toTitleCase(d.category)} - ${minStr} to ${maxStr} YoE`
    }

    const disableClosingAnimation = (idx: number | null) => {
        if (idx === null) return

        const accordionEl =
            containerRef.current?.querySelectorAll<HTMLFormElement>(".MuiCollapse-root")[idx]
        if (!accordionEl) {
            console.error(`Open accordion at index ${idx} not found.`)
            return
        }

        // Hack for killing the animation
        // Ideally we'd override transition-duration in the CSS,
        // but the styles are being set via JS on open / close,
        // making the override timing difficult
        accordionEl.style.display = "none"
        setTimeout(() => (accordionEl.style.display = ""), 0)
    }

    return (
        <form ref={containerRef} className={styles.container}>
            <div>
                {labelFields.fields.map((item, idx) => (
                    <Accordion
                        onChange={(_, isExpanded) => onAccordionToggle(isExpanded, idx)}
                        expanded={openPanel === idx}
                        key={idx}
                    >
                        <Box className="accordion-summary-container">
                            <AccordionSummary>
                                <span className="summary-label">{getLabelSummary(idx)}</span>
                            </AccordionSummary>
                            <div className="actions">
                                <IconButton onClick={() => onDeleteLabel(idx)}>
                                    <DeleteIcon className="delete" />
                                </IconButton>
                                <IconButton className="expand">
                                    <ExpandMoreIcon />
                                </IconButton>
                            </div>
                        </Box>
                        <AccordionDetails>
                            <Label.Component
                                key={item.id}
                                form={form}
                                formPath={`labels.${idx}`}
                                activeSelectionState={activeSelectionState}
                                activeCitationPath={activeCitationPath}
                                setActiveCitationPath={setActiveCitationPath}
                                setHighlightState={setHighlightState}
                            />
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>

            <div className="add-label-container">
                <Button type="button" variant="outlined" onClick={onAddLabel}>
                    <span className="icon">+</span>
                    <span className="label">Add Label</span>
                </Button>
            </div>
            <div className="submit-container">
                <Button type="button" variant="contained" onClick={onSubmit}>
                    Save
                </Button>
            </div>
        </form>
    )
}
