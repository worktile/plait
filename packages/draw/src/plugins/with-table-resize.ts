import { getHitElementByPoint, PlaitBoard, Point, RectangleClient, Transforms, isSelectedElement } from '@plait/core';
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
import { getCellsWithPoints, updateColumns, updateRows } from '../utils/table';
import { getHitRectangleResizeHandleRef } from '../utils/position/geometry';
import { getResizeOriginPointAndHandlePoint, getResizeZoom, movePointByZoomAndOriginPoint } from './with-draw-resize';
import { getSnapResizingRef, getSnapResizingRefOptions } from '../utils/snap-resizing';
import { PlaitDrawElement } from '../interfaces';
import { isSingleSelectElementByTable } from '../utils';

interface TableResizeOptions extends ResizeOptions {
    cell: PlaitTableCellWithPoints;
}

const MIN_CELL_SIZE = 32;

export function withTableResize(board: PlaitTableBoard) {
    let snapG: SVGGElement | null;

    const options: WithResizeOptions<PlaitBaseTable, ResizeHandle, TableResizeOptions> = {
        key: 'draw-table',
        canResize: () => {
            return true;
        },
        hitTest: (point: Point) => {
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitDrawElement.isElementByTable(hitElement)) {
                const cells = getCellsWithPoints(board, hitElement);
                for (let i = 0; i < cells.length; i++) {
                    const rectangle = RectangleClient.getRectangleByPoints(cells[i].points);
                    const handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, 0);
                    if (handleRef && !isCornerHandle(board, handleRef.handle)) {
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
                const rectangle = board.getRectangle(hitElement) as RectangleClient;
                const handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, hitElement.angle);
                if (handleRef) {
                    const selectElement = isSelectedElement(board, hitElement);
                    if (
                        (selectElement && isSingleSelectElementByTable(board)) ||
                        (!selectElement && !isCornerHandle(board, handleRef.handle))
                    ) {
                        return {
                            element: hitElement,
                            handle: handleRef.handle,
                            cursorClass: handleRef.cursorClass,
                            rectangle
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
                const { originPoint, handlePoint } = getResizeOriginPointAndHandlePoint(board, handleIndex, resizeRef.rectangle!);
                const resizePoints: [Point, Point] = [resizeState.startPoint, resizeState.endPoint];
                const { xZoom, yZoom } = getResizeZoom(resizePoints, originPoint, handlePoint, false, false);
                const originPoints = resizeRef.options?.cell.points;
                const targetPoints = originPoints.map(p => {
                    return movePointByZoomAndOriginPoint(p, originPoint, xZoom, yZoom);
                }) as [Point, Point];

                const originRect = RectangleClient.getRectangleByPoints(originPoints);
                const targetRect = RectangleClient.getRectangleByPoints(targetPoints);
                const offsetWidth = targetRect.width - originRect.width;
                const offsetHeight = targetRect.height - originRect.height;
                const direction = getResizeCellDirection(handleIndex);
                if (offsetWidth !== 0 && direction) {
                    const columnIndex = getResizeColumnOrRowIndex(resizeRef.element, resizeRef.options?.cell, direction, false);
                    let width = targetPoints[1][0] - targetPoints[0][0];
                    if (resizeRef.options?.cell.colspan && resizeRef.options?.cell.colspan !== 1) {
                        const columnWidth = getResizeColumnOrRowSize(board, resizeRef.element, columnIndex, false);
                        width = columnWidth + offsetWidth;
                    }
                    if (width >= MIN_CELL_SIZE) {
                        const { columns, points } = updateColumns(
                            resizeRef.element,
                            resizeRef.element.columns[columnIndex].id,
                            width,
                            offsetWidth,
                            direction
                        );
                        Transforms.setNode(board, { columns, points }, path);
                    }
                }
                if (offsetHeight !== 0 && direction) {
                    const rowIndex = getResizeColumnOrRowIndex(resizeRef.element, resizeRef.options?.cell, direction, true);
                    let height = targetPoints[1][1] - targetPoints[0][1];
                    if (resizeRef.options?.cell.rowspan && resizeRef.options?.cell.rowspan !== 1) {
                        const rowHeight = getResizeColumnOrRowSize(board, resizeRef.element, rowIndex, true);
                        height = rowHeight + offsetHeight;
                    }
                    if (height >= MIN_CELL_SIZE) {
                        const { rows, points } = updateRows(
                            resizeRef.element,
                            resizeRef.element.rows[rowIndex].id,
                            height,
                            offsetHeight,
                            direction
                        );
                        Transforms.setNode(board, { rows, points }, path);
                    }
                }
            } else {
                const isFromCorner = isCornerHandle(board, resizeRef.handle);
                if (isFromCorner) {
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
                        true,
                        true
                    );
                    const resizeSnapRef = getSnapResizingRef(board, [resizeRef.element], resizeSnapRefOptions);
                    snapG = resizeSnapRef.snapG;
                    PlaitBoard.getElementActiveHost(board).append(snapG);
                    const points = resizeSnapRef.activePoints as [Point, Point];
                    const originPoints = resizeRef.element.points;
                    const originRect = RectangleClient.getRectangleByPoints(originPoints);
                    const targetRect = RectangleClient.getRectangleByPoints(points);
                    const offsetWidth = targetRect.width - originRect.width;
                    const offsetHeight = targetRect.height - originRect.height;
                    let columns = [...resizeRef.element.columns];
                    let rows = [...resizeRef.element.rows];
                    if (offsetWidth !== 0) {
                        columns = calculateRowsOrColumns(columns, offsetWidth, originRect.width, false);
                    }
                    if (offsetHeight !== 0) {
                        rows = calculateRowsOrColumns(rows, offsetHeight, originRect.height, true);
                    }
                    Transforms.setNode(board, { points: normalizeShapePoints(points), rows, columns }, path);
                }
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

function calculateRowsOrColumns(
    data: { id: string; width?: number; height?: number }[],
    offset: number,
    originSize: number,
    isRow: boolean
) {
    const dimension = isRow ? 'height' : 'width';
    return data.map(item => {
        if (item[dimension]) {
            const value = item[dimension]! + offset * (item[dimension]! / originSize);
            return {
                ...item,
                [dimension]: value
            };
        }
        return item;
    });
}

function getResizeCellDirection(handleIndex: number) {
    if ([Number(ResizeHandle.s), Number(ResizeHandle.e)].includes(handleIndex)) {
        return 'end';
    }
    if ([Number(ResizeHandle.n), Number(ResizeHandle.w)].includes(handleIndex)) {
        return 'start';
    }
    return undefined;
}

function getResizeColumnOrRowIndex(element: PlaitBaseTable, resizeCell: PlaitTableCell, direction: 'start' | 'end', isRow: boolean) {
    const data = isRow ? element.rows : element.columns;
    const id = isRow ? resizeCell.rowId : resizeCell.columnId;
    const span = isRow ? resizeCell.rowspan : resizeCell.colspan;
    let index = data.findIndex(item => item.id === id);
    if (direction === 'end' && span && span !== 1) {
        index += span - 1;
    }
    return index;
}

function getResizeColumnOrRowSize(board: PlaitBoard, element: PlaitBaseTable, index: number, isRow: boolean) {
    const size = isRow ? element.rows[index]['height'] : element.columns[index]['width'];
    if (size) {
        return size;
    }
    const id = isRow ? element.rows[index].id : element.columns[index].id;
    const dimension = isRow ? 'height' : 'width';
    const cellsWithPoints = getCellsWithPoints(board, element);
    const minDimension = cellsWithPoints.reduce((acc, item) => {
        const itemId = isRow ? item.rowId : item.columnId;
        if (itemId === id) {
            const rectangle = RectangleClient.getRectangleByPoints(item.points);
            const itemSize = rectangle[dimension];
            if (!acc || itemSize < acc) {
                acc = itemSize;
            }
        }
        return acc;
    }, 0);

    return minDimension;
}
