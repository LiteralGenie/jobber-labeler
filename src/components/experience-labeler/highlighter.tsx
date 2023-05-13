import { IndeedPost } from "@/models"
import styles from "./highlighter.module.scss"
import { ActiveSelectionState, CitationPath, ExperienceLabelForm } from "./experience-labeler"
import { exhaustMap, fromEvent, map, merge, take, tap } from "rxjs"
import { Dispatch, RefObject, SetStateAction, useEffect, useRef } from "react"
import { UseFormReturn, UseFormSetValue } from "react-hook-form"

export type HighlighterProps = {
    form: UseFormReturn<ExperienceLabelForm>
    sample: IndeedPost.Model
    activeSelectionState: ActiveSelectionState
    setActiveSelectionState: Dispatch<SetStateAction<ActiveSelectionState>>
    activeCitationPath: CitationPath | null
}

export default function Highlighter({
    form,
    sample,
    activeSelectionState,
    setActiveSelectionState,
    activeCitationPath,
}: HighlighterProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    useEffect(
        () => onSelection(containerRef, activeSelectionState, form.setValue),
        [containerRef, activeSelectionState, form]
    )
    useEffect(
        () => onSelectionStartEnd(containerRef, setActiveSelectionState, activeCitationPath),
        [setActiveSelectionState, activeCitationPath]
    )

    return (
        <div ref={containerRef} className={styles.container}>
            {sample.textContent}
        </div>
    )
}

function onSelection(
    target: RefObject<HTMLElement>,
    activeSelectionState: ActiveSelectionState,
    setFormValue: UseFormSetValue<ExperienceLabelForm>
) {
    const tgt = target.current
    if (tgt === null) return

    const select$ = fromEvent<any>(document, "selectionchange")
    const handleSelect$ = select$.pipe(
        tap(() => {
            if (!activeSelectionState.activeCitation) {
                return
            }

            const sel = window.getSelection() as Selection
            const { anchorNode, focusNode } = sel as {
                anchorNode: Node
                focusNode: Node
            }

            // Check if sample text was in the selection
            const ranges = [...Array(sel.rangeCount).keys()].map((i) => sel.getRangeAt(i))
            const isTargetSelected = ranges.some((r) => r.intersectsNode(tgt))
            if (!isTargetSelected) {
                return
            }

            // Find where selection starts (inclusive) / ends (exclusive) wrt target
            let selection = { start: 0, end: tgt.textContent!.length }
            const position = anchorNode.compareDocumentPosition(focusNode)
            const direction = position === Node.DOCUMENT_POSITION_PRECEDING ? "backward" : "forward"

            const isTargetNode = (node: Node) =>
                node === tgt || Array.from(tgt.childNodes).some((tgtChild) => node === tgtChild)
            if (isTargetNode(anchorNode) && isTargetNode(focusNode)) {
                const [start, end] = [sel.anchorOffset, sel.focusOffset]
                selection = { start, end }
            } else if (isTargetNode(anchorNode)) {
                if (direction === "forward") {
                    selection.start = sel.anchorOffset
                } else {
                    selection.end = sel.anchorOffset
                }
            } else if (isTargetNode(focusNode)) {
                if (direction === "forward") {
                    selection.start = sel.focusOffset
                } else {
                    selection.end = sel.focusOffset
                }
            }

            if (selection.start === selection.end) {
                return
            }

            // Notify of selection change
            return setFormValue(activeSelectionState.activeCitation.path, selection)
        })
    )

    const sub = merge(handleSelect$).subscribe()
    return () => {
        sub.unsubscribe()
    }
}

function onSelectionStartEnd(
    target: RefObject<HTMLElement>,
    setActiveSelectionState: HighlighterProps["setActiveSelectionState"],
    activeCitationPath: CitationPath | null
) {
    const tgt = target.current
    if (tgt === null) return

    const mousedown$ = fromEvent<MouseEvent>(tgt, "mousedown")
    const mouseup$ = fromEvent<Event>(document, "mouseup")

    const sub = mousedown$
        .pipe(
            map(() =>
                activeCitationPath
                    ? {
                          path: activeCitationPath,
                          element: document.activeElement as HTMLInputElement,
                      }
                    : null
            ),
            tap((activeCitation) => {
                setActiveSelectionState((state) => ({
                    ...state,
                    activeCitation: activeCitation,
                    isSelecting: true,
                }))
            }),
            exhaustMap((activeCitation) =>
                mouseup$.pipe(
                    take(1),
                    map(() => activeCitation)
                )
            ),
            tap((activeCitation) => {
                if (!activeCitation) {
                    return
                }
                const { path, element } = activeCitation

                console.log("end", path, element)
                if (path && element) {
                    ;(element as HTMLInputElement).focus()
                }
                setActiveSelectionState((state) => ({
                    ...state,
                    activeCitation: null,
                    isSelecting: false,
                }))
            })
        )
        .subscribe()

    return () => {
        sub.unsubscribe()
    }
}
