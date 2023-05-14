import { IndeedPost } from "@/models"
import styles from "./highlighter.module.scss"
import {
    ActiveSelectionState,
    CitationPath,
    ExperienceLabelForm,
    HighlightState,
} from "./experience-labeler"
import { exhaustMap, fromEvent, map, merge, take, tap } from "rxjs"
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react"
import { UseFormReturn, UseFormSetValue } from "react-hook-form"
import { Button, Paper } from "@mui/material"

export type HighlighterProps = {
    form: UseFormReturn<ExperienceLabelForm>
    sample: IndeedPost.Model
    activeSelectionState: ActiveSelectionState
    setActiveSelectionState: Dispatch<SetStateAction<ActiveSelectionState>>
    activeCitationPath: CitationPath | null
    highlightState: HighlightState
}

type Rect = {}

export default function Highlighter({
    form,
    sample,
    activeSelectionState,
    setActiveSelectionState,
    activeCitationPath,
    highlightState,
}: HighlighterProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const [focusRects, setFocusRects] = useState<DOMRect[]>([])
    const [hoverRects, setHoverRects] = useState<DOMRect[]>([])

    // Handle selections
    useEffect(
        () => onSelection(textRef, activeSelectionState, form.setValue),
        [textRef, activeSelectionState, form]
    )
    useEffect(
        () => onSelectionStartEnd(textRef, setActiveSelectionState, activeCitationPath),
        [setActiveSelectionState, activeCitationPath]
    )

    // Handle highlights (fake selections)
    useEffect(() => {
        onUpdateRects(highlightState, activeSelectionState, textRef, setFocusRects, setHoverRects)
    }, [highlightState, activeSelectionState, textRef, setFocusRects, setHoverRects])

    // Handle window resize
    useEffect(() => {
        const sub = fromEvent(window, "resize").subscribe(() => {
            onUpdateRects(
                highlightState,
                activeSelectionState,
                textRef,
                setFocusRects,
                setHoverRects
            )
        })

        return () => {
            sub.unsubscribe()
        }
    }, [highlightState, activeSelectionState, textRef, setFocusRects, setHoverRects])

    return (
        <div
            className={[
                styles.container,
                // Indicate that user selection will have side effects
                activeCitationPath ? styles.focused : "",
            ].join(" ")}
        >
            <div className="scroll-container">
                <Paper ref={containerRef} elevation={1} className="text-container">
                    <div ref={textRef}>{sample.textContent}</div>
                    <div className="highlight-overlay">
                        {hoverRects.map((r, idx) => (
                            <div
                                className="hover"
                                key={idx}
                                style={convertAbsoluteToRelative(containerRef, r)}
                            ></div>
                        ))}
                        {focusRects.map((r, idx) => (
                            <div
                                className="focus"
                                key={idx}
                                style={convertAbsoluteToRelative(containerRef, r)}
                            ></div>
                        ))}
                    </div>
                </Paper>
                <div className="scroll-marker-container">
                    {hoverRects.map((r) => {
                        const { top, height } = convertAbsoluteToPercentage(
                            containerRef,
                            textRef,
                            r
                        )
                        return (
                            <div
                                className="hover"
                                style={{ top: `${top * 100}%`, height: `${height * 100}%` }}
                            ></div>
                        )
                    })}
                    {focusRects.map((r) => {
                        const { top, height } = convertAbsoluteToPercentage(
                            containerRef,
                            textRef,
                            r
                        )
                        return (
                            <div
                                className="focus"
                                style={{ top: `${top * 100}%`, height: `${height * 100}%` }}
                            ></div>
                        )
                    })}
                </div>
            </div>
            <div className="actions">
                <Button variant="outlined">Done Selecting</Button>
            </div>
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

function onUpdateRects(
    highlightState: HighlightState,
    activeSelectionState: ActiveSelectionState,
    containerRef: RefObject<HTMLElement>,
    setFocusRects: Dispatch<SetStateAction<DOMRect[]>>,
    setHoverRects: Dispatch<SetStateAction<DOMRect[]>>
) {
    if (activeSelectionState.isSelecting) return

    const tgt = containerRef.current?.childNodes[0]
    if (!tgt) return

    const sel = window.getSelection() as Selection
    sel.removeAllRanges()

    const { focus, hover } = highlightState
    if (focus) {
        const range = document.createRange()
        range.setStart(tgt, focus.start)
        range.setEnd(tgt, focus.end)
        setFocusRects([...range.getClientRects()])
    } else {
        setFocusRects([])
    }

    if (hover) {
        const range = document.createRange()
        range.setStart(tgt, hover.start)
        range.setEnd(tgt, hover.end)
        setHoverRects([...range.getClientRects()])
    } else {
        setHoverRects([])
    }

    const isSameSelection = focus?.start === hover?.start && focus?.end === hover?.end
    if (isSameSelection) {
        setHoverRects([])
    }
}

type Coords = { top: number; left: number; height: number; width: number }
function convertAbsoluteToRelative(anchor: RefObject<HTMLElement>, coords: Coords): Coords {
    const tgt = anchor.current
    if (!tgt) return coords

    const { top: anchorTop, left: anchorLeft } = tgt.getBoundingClientRect()
    const { scrollTop, scrollLeft } = tgt

    const relTop = coords.top + scrollTop - anchorTop
    const relLeft = coords.left + scrollLeft - anchorLeft

    return {
        top: relTop,
        left: relLeft,
        height: coords.height,
        width: coords.width,
    }
}

type ScrollMarkerCoords = { top: number; height: number }
function convertAbsoluteToPercentage(
    containerRef: RefObject<HTMLElement>,
    textRef: RefObject<HTMLElement>,
    coords: Coords
): ScrollMarkerCoords {
    const container = containerRef.current
    if (!container) return coords

    const text = textRef.current
    if (!text) return coords

    const containerStyles = getComputedStyle(container)
    const paddingTop = parseInt(containerStyles["paddingTop"])

    const { top: textTop, height: textHeight } = text.getBoundingClientRect()

    const relTop = coords.top - textTop
    const percentTop = relTop / textHeight
    const percentHeight = coords.height / textHeight
    const percentOffset = paddingTop / textHeight

    return {
        top: percentTop - percentOffset,
        height: percentHeight + 0.01,
    }
}
