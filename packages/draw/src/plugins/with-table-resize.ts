import { PlaitBoard, Point, RectangleClient, Transforms, getSelectedElements, hasValidAngle } from '@plait/core';
import { PlaitBaseTable, PlaitTableBoard, PlaitTableCell, PlaitTableCellWithPoints } from '../interfaces/table';
import {
    getIndexByResizeHandle,
    isCornerHandle,
    ResizeOptions,
    ResizeHandle,
    ResizeRef,
    ResizeState,
    withResize,
    WithResizeOptions,
    normalizeShapePoints
} from '@plait/common';
import { getCellsWithPoints, getCurrentRowOrColumnSize, ResizeEdge, updateColumns, updateRows } from '../utils/table';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeOriginPointAndHandlePoint } from './with-draw-resize';
import { getSnapResizingRef, getSnapResizingRefOptions } from '../utils/snap-resizing';
import { PlaitDrawElement } from '../interfaces';
import { isSingleSelectTable } from '../utils';

// const debugKey = 'debug:plait:table:resize';
// const debugGenerator = createDebugGenerator(debugKey);

interface TableResizeOptions extends ResizeOptions {
    cell: PlaitTableCellWithPoints;
}

const MIN_CELL_SIZE = 20;

export function withTableResize(board: PlaitTableBoard) {
    let snapG: SVGGElement | null;

    const options: WithResizeOptions<PlaitBaseTable, ResizeHandle, TableResizeOptions> = {
        key: 'draw-table',
        canResize: () => {
            const selectedElements = getSelectedElements(board);
            return isSingleSelectTable(board) && !hasValidAngle(selectedElements[0]);
        },
        hitTest: (point: Point) => {
            const selectedElements = getSelectedElements(board);
            const hitElement = selectedElements[0];
            // debugGenerator.clear();
            if (hitElement && PlaitDrawElement.isElementByTable(hitElement)) {
                const tableRectangle = board.getRectangle(hitElement) as RectangleClient;
                // debugGenerator.drawRectangle(board, tableRectangle);
                // debugGenerator.drawCircles(board, [point], 5);
                const tableHandleRef = getHitRectangleResizeHandleRef(board, tableRectangle, point, hitElement.angle);
                if (tableHandleRef && isCornerHandle(board, tableHandleRef.handle)) {
                    return {
                        element: hitElement,
                        handle: tableHandleRef.handle,
                        cursorClass: tableHandleRef.cursorClass,
                        rectangle: tableRectangle
                    };
                }

                const cells = getCellsWithPoints(board, hitElement);
                for (let i = 0; i < cells.length; i++) {
                    const rectangle = RectangleClient.getRectangleByPoints(cells[i].points);
                    const handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, 0, true);
                    if (handleRef) {
                        return {
                            element: hitElement,
                            handle: handleRef.handle,
                            cursorClass: handleRef.cursorClass,
                            rectangle,
                            options: {
                                cell: cells[i]
                            }
                        };
                    }
                }
            }
            return null;
        },
        onResize: (resizeRef: ResizeRef<PlaitBaseTable, ResizeHandle, TableResizeOptions>, resizeState: ResizeState) => {
            snapG?.remove();
            const path = PlaitBoard.findPath(board, resizeRef.element);
            if (resizeRef.options?.cell && resizeRef.rectangle) {
                const handleIndex = getIndexByResizeHandle(resizeRef.handle);
                const edge = getResizeEdge(handleIndex);
                if (edge) {
                    const isRow = isRowResizeHandle(handleIndex);
                    const pointerOffset = isRow
                        ? resizeState.endPoint[1] - resizeState.startPoint[1]
                        : resizeState.endPoint[0] - resizeState.startPoint[0];
                    const targetIndex = getResizeTargetRowOrColumnIndex(resizeRef.element, resizeRef.options.cell, edge, isRow);
                    if (targetIndex < 0) {
                        return;
                    }
                    const currentSize = getCurrentRowOrColumnSize(resizeRef.element, targetIndex, isRow);
                    const sizeOffset = edge === 'start' ? -pointerOffset : pointerOffset;
                    const targetSize = Math.max(MIN_CELL_SIZE, currentSize + sizeOffset);
                    const appliedOffset = targetSize - currentSize;
                    if (isRow) {
                        const { rows, points } = updateRows(
                            resizeRef.element,
                            resizeRef.element.rows[targetIndex].id,
                            targetSize,
                            appliedOffset,
                            edge
                        );
                        Transforms.setNode(board, { rows, points }, path);
                    } else {
                        const { columns, points } = updateColumns(
                            resizeRef.element,
                            resizeRef.element.columns[targetIndex].id,
                            targetSize,
                            appliedOffset,
                            edge
                        );
                        Transforms.setNode(board, { columns, points }, path);
                    }
                }
            } else if (isCornerHandle(board, resizeRef.handle)) {
                const isAspectRatio = resizeState.isShift;
                const handleIndex = getIndexByResizeHandle(resizeRef.handle);
                const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, handleIndex, resizeRef.rectangle!);
                const resizeSnapRefOptions = getSnapResizingRefOptions(
                    board,
                    resizeRef,
                    resizeState,
                    {
                        originPoint,
                        handlePoint
                    },
                    isAspectRatio,
                    true
                );
                const resizeSnapRef = getSnapResizingRef(board, [resizeRef.element], resizeSnapRefOptions);
                snapG = resizeSnapRef.snapG;
                PlaitBoard.getElementTopHost(board).append(snapG);
                const points = resizeSnapRef.activePoints as [Point, Point];
                const originPoints = resizeRef.element.points;
                const originRect = RectangleClient.getRectangleByPoints(originPoints);
                const targetRect = RectangleClient.getRectangleByPoints(points);
                const offsetWidth = targetRect.width - originRect.width;
                const offsetHeight = targetRect.height - originRect.height;
                let columns = [...resizeRef.element.columns];
                let rows = [...resizeRef.element.rows];
                if (offsetWidth !== 0) {
                    columns = scaleRowsOrColumns(columns, offsetWidth, originRect.width, false);
                }
                if (offsetHeight !== 0) {
                    rows = scaleRowsOrColumns(rows, offsetHeight, originRect.height, true);
                }
                Transforms.setNode(board, { points: normalizeShapePoints(points), columns, rows }, path);
            }
        },
        afterResize: (resizeRef: ResizeRef<PlaitBaseTable, ResizeHandle, TableResizeOptions>) => {
            snapG?.remove();
            snapG = null;
        }
    };

    withResize<PlaitBaseTable, ResizeHandle, TableResizeOptions>(board, options);

    return board;
}

function isRowResizeHandle(handleIndex: number) {
    return [Number(ResizeHandle.n), Number(ResizeHandle.s)].includes(handleIndex);
}

function scaleRowsOrColumns(data: { id: string; width?: number; height?: number }[], offset: number, originSize: number, isRow: boolean) {
    const dimension = isRow ? 'height' : 'width';
    return data.map((item) => {
        if (item[dimension]) {
            return {
                ...item,
                [dimension]: item[dimension]! + offset * (item[dimension]! / originSize)
            };
        }
        return item;
    });
}

function getResizeEdge(handleIndex: number): ResizeEdge | undefined {
    if ([Number(ResizeHandle.s), Number(ResizeHandle.e)].includes(handleIndex)) {
        return 'end';
    }
    if ([Number(ResizeHandle.n), Number(ResizeHandle.w)].includes(handleIndex)) {
        return 'start';
    }
    return undefined;
}

function getResizeTargetRowOrColumnIndex(element: PlaitBaseTable, resizeCell: PlaitTableCell, edge: ResizeEdge, isRow: boolean) {
    const data = isRow ? element.rows : element.columns;
    const id = isRow ? resizeCell.rowId : resizeCell.columnId;
    const span = isRow ? resizeCell.rowspan : resizeCell.colspan;
    let index = data.findIndex((item) => item.id === id);
    if (edge === 'end' && span && span !== 1) {
        index += span - 1;
    }
    return index;
}
