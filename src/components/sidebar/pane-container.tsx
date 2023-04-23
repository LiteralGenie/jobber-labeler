/** @jsxImportSource @emotion/react */

import { immerable } from "immer"
import { useEffect, useRef } from "react"
import { concat, fromEvent, Observable, of } from "rxjs"
import { exhaustMap, takeUntil, tap } from "rxjs/operators"
import { useImmer } from "use-immer"
import {
    defaultSidebarState,
    SidebarActions,
} from "@/store/features/sidebar.slice"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { noop } from "@/utils"
import { PaneContainerStyles } from "./styles"
import { PaneContainerProps } from "./types"

/**
 * The active pane
 */
export default function PaneContainer({ children: pane }: PaneContainerProps) {
    const dispatch = useAppDispatch()
    const paneWidth = useAppSelector((state) => state.activePane.width)
    const displaySelection = useAppSelector(
        (state) => state.activePane.displaySelection
    )

    const [resizeContext, updateResizeContext] = useImmer(
        new ResizeContext(paneWidth)
    )

    const resizeHandle = useRef<HTMLDivElement>(null)

    // Resize the pane on drag
    useEffect(() => {
        if (!resizeHandle.current) return noop

        // When a drag is started, mark the start location
        const mousedown$ = fromEvent<MouseEvent>(
            resizeHandle.current,
            "mousedown"
        )
        const onMousedown = (ev: MouseEvent) => {
            updateResizeContext((draft) => {
                draft.dragStartX = ev.screenX
            })
        }

        // When dragging, update distance from initial mousedown
        const mousemove$ = fromEvent<MouseEvent>(window, "mousemove")
        const onMousemove = (ev: MouseEvent) => {
            updateResizeContext((draft) => {
                if (draft.dragStartX === undefined) {
                    console.error("Dragging without start location")
                    return
                }

                // Get offset and check for overflow
                const minWidth = 150 // @TODO: calculate this
                const minOffset = minWidth - resizeContext.initialPaneWidth
                const offset = ev.screenX - draft.dragStartX

                draft.dragOffsetX = Math.max(offset, minOffset)
                draft.isOverflowing = offset < minOffset
            })

            // If overflowing, hide the pane
            // (But don't actually unselect it, which would destroy this component.
            // We want to continue the drag to provide a chance to re-expand it)
            const newVal = !resizeContext.isOverflowing
            const needsUpdate = newVal !== displaySelection
            if (needsUpdate) {
                dispatch(SidebarActions.setDisplaySelection(newVal))
            }
        }

        // When a drag ends, update store with pane width and clean up
        const mouseup$ = fromEvent<MouseEvent>(window, "mouseup")
        const onMouseup = () => {
            if (resizeContext.isOverflowing) {
                // If overflow, unselect the panel for real
                dispatch(SidebarActions.setActivePaneId(null))
                dispatch(SidebarActions.setWidth(defaultSidebarState.width))
                dispatch(SidebarActions.setDisplaySelection(true))
            } else {
                // Otherwise, save the new width
                dispatch(
                    SidebarActions.setWidth(resizeContext.currentPaneWidth)
                )
            }

            updateResizeContext((draft) => {
                // Reset ctx to defaults
                draft.initialPaneWidth = draft.currentPaneWidth
                draft.dragStartX = undefined
                draft.dragOffsetX = 0
                draft.isOverflowing = false
            })
        }

        // An observable that emits if a drag is started (or already in progress)
        const dragStart$ = (
            resizeContext.isDragging ? concat(of(null), mousedown$) : mousedown$
        ) as Observable<MouseEvent | null>

        const drag$ = dragStart$.pipe(
            tap((ev: MouseEvent | null) => {
                // Only fire onMousedown when a *new* drag is started
                if (ev === null) return
                onMousedown(ev)
            }),
            // Ignore mousedown events until we get a mouseup
            exhaustMap(() =>
                mousemove$.pipe(
                    takeUntil(mouseup$.pipe(tap(onMouseup))),
                    tap(onMousemove)
                )
            )
        )

        const sub = drag$.subscribe()
        return () => sub.unsubscribe()
    }, [
        displaySelection,
        resizeContext,
        resizeHandle,
        dispatch,
        updateResizeContext,
    ])

    return (
        <div
            css={PaneContainerStyles}
            style={{
                width: resizeContext.currentPaneWidth,
                display: displaySelection ? "" : "none",
            }}
        >
            {/* Content */}
            <div className="content">{pane}</div>

            {/* Resize handle */}
            <div className="handle" ref={resizeHandle}>
                <div className="handle__visible"></div>
            </div>
        </div>
    )
}

export class ResizeContext {
    [immerable] = true

    dragStartX?: number
    dragOffsetX: number = 0
    isOverflowing = false

    constructor(public initialPaneWidth: number) {}

    get isDragging() {
        return !!this.dragStartX
    }

    get currentPaneWidth() {
        return this.dragOffsetX + this.initialPaneWidth
    }
}
