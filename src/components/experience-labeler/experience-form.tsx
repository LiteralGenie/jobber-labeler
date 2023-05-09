import styles from "./experience-form.module.scss"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { Dispatch, SetStateAction, useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material"
import { toTitleCase } from "@/utils"
import * as Label from "./label"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

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
            conditions: [],
            citations: [{ start: 0, end: 1 }],
        })
        onAccordionToggle(true, labelFields.fields.length)

        return false
    }

    const [openPanel, setOpenPanel] = useState(0 as number | null)
    const onAccordionToggle = (isExpanded: boolean, idx: number) => {
        setOpenPanel(isExpanded ? idx : null)
    }

    const getLabelSummary = (idx: number) => {
        const d = getValues(`labels.${idx}`)
        return `${toTitleCase(d.category)} - ${d.min || "?"} to ${d.max || "?"} YoE`
    }

    return (
        <form className={styles.form}>
            {labelFields.fields.map((item, idx) => (
                <Accordion
                    onChange={(_, isExpanded) => onAccordionToggle(isExpanded, idx)}
                    expanded={openPanel === idx}
                    key={idx}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <span className="summary-label">{getLabelSummary(idx)}</span>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Label.Component
                            key={item.id}
                            form={form}
                            formPath={`labels.${idx}`}
                            selectionState={selectionState}
                            setSelectionState={setSelectionState}
                        />
                    </AccordionDetails>
                </Accordion>
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
