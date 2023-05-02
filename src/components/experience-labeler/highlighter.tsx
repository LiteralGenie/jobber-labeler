/** @jsxImportSource @emotion/react */

import { ExperienceLabel, IndeedPost } from "@/models"
import { css } from "@emotion/react"
import { ExperienceLabelForm, SelectionState } from "./experience-labeler"
import { UseFormReturn } from "react-hook-form"
import { fromEvent, map, withLatestFrom } from "rxjs"
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react"

export type HighlighterProps = {
    sample: IndeedPost.Model
    selectionState: SelectionState
    setSelectionState: Dispatch<SetStateAction<SelectionState>>
}

export default function Highlighter({
    sample,
    selectionState,
    setSelectionState,
}: HighlighterProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(() => onSelection(containerRef, setSelectionState), [containerRef, setSelectionState])
    useEffect(() => onSelectionChange(containerRef, selectionState), [containerRef, selectionState])

    return (
        <div ref={containerRef} css={styles}>
            {sample.textContent}
        </div>
    )
}

const styles = css({
    whiteSpace: "pre-wrap",
})

function onSelection(
    target: RefObject<HTMLElement>,
    setSelectionState: HighlighterProps["setSelectionState"]
) {
    const tgt = target.current
    if (tgt === null) return

    const select$ = fromEvent<Event>(document, "selectionchange")
    const mousedown$ = fromEvent<Event>(document, "mousedown")

    const obs$ = select$.pipe(
        withLatestFrom(mousedown$.pipe(map(() => document.activeElement))),
        map(([_, activeEl]) => [activeEl, document.getSelection() as Selection] as const),
        map(([activeEl, sel]) => {
            const { anchorNode, focusNode } = sel as { anchorNode: Node; focusNode: Node }
            let update: Partial<SelectionState> = { initialFocusEl: activeEl }

            // Check if sample text was in the selection
            const ranges = [...Array(sel.rangeCount).keys()].map((i) => sel.getRangeAt(i))
            const isTargetSelected = ranges.some((r) => r.intersectsNode(tgt))
            if (!isTargetSelected) {
                update.selection = null
                return setSelectionState((state) => ({ ...state, ...update }))
            }

            // Find where selection starts (inclusive) / ends (exclusive) wrt target
            update.selection = { start: 0, end: tgt.textContent!.length }

            const position = anchorNode.compareDocumentPosition(focusNode)
            const direction = position === Node.DOCUMENT_POSITION_PRECEDING ? "backward" : "forward"

            const isTargetNode = (node: Node) =>
                node === tgt || Array.from(tgt.childNodes).some((tgtChild) => node === tgtChild)
            if (isTargetNode(anchorNode) && isTargetNode(focusNode)) {
                update.selection.start = sel.anchorOffset
                update.selection.end = sel.focusOffset
            } else if (isTargetNode(anchorNode)) {
                if (direction === "forward") {
                    update.selection.start = sel.anchorOffset
                } else {
                    update.selection.end = sel.anchorOffset
                }
            } else if (isTargetNode(focusNode)) {
                if (direction === "forward") {
                    update.selection.start = sel.focusOffset
                } else {
                    update.selection.end = sel.focusOffset
                }
            }

            // Notify of selection change
            if (update.selection.start === update.selection.end) {
                update.selection = null
            }

            return setSelectionState((state) => ({ ...state, ...update }))
        })
    )

    const sub = obs$.subscribe()
    return () => sub.unsubscribe()
}

function onSelectionChange(target: RefObject<HTMLElement>, { selection }: SelectionState) {
    if (!selection) return
    const { start, end } = selection

    const tgt = target.current
    if (!tgt) return

    const sel = window.getSelection() as Selection
    const textNode = tgt.childNodes[0]
    if (
        sel.anchorNode === textNode &&
        sel.focusNode === textNode &&
        sel.anchorOffset === start &&
        sel.focusOffset === end
    ) {
        return
    }

    const range = document.createRange()
    range.setStart(textNode, start)
    range.setEnd(textNode, end)

    sel.removeAllRanges()
    sel.addRange(range)
}
