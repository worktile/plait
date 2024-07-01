import { getHitElementByPoint, PlaitBoard, Point, RectangleClient, Transforms, isSelectedElement } from '@plait/core';
import { PlaitBaseTable, PlaitTableBoard, PlaitTableCellWithPoints } from '../interfaces/table';
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
                let rectangle = board.getRectangle(hitElement) as RectangleClient;
                let handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, hitElement.angle);
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
                const cells = getCellsWithPoints(board, hitElement);
                for (let i = 0; i < cells.length; i++) {
                    rectangle = RectangleClient.getRectangleByPoints(cells[i].points);
                    handleRef = getHitRectangleResizeHandleRef(board, rectangle, point, 0);
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
                const offsetX = targetPoints[1][0] - originPoints[1][0];
                const offsetY = targetPoints[1][1] - originPoints[1][1];
                const width = targetPoints[1][0] - targetPoints[0][0];
                const height = targetPoints[1][1] - targetPoints[0][1];
                if (offsetX !== 0 && width >= MIN_CELL_SIZE) {
                    const { columns, points } = updateColumns(resizeRef.element, resizeRef.options?.cell.columnId, width, offsetX);
                    Transforms.setNode(board, { columns, points }, path);
                } else if (offsetY !== 0 && height >= MIN_CELL_SIZE) {
                    const { rows, points } = updateRows(resizeRef.element, resizeRef.options?.cell.rowId, height, offsetY);
                    Transforms.setNode(board, { rows, points }, path);
                }
            } else {
                const isFromCorner = isCornerHandle(board, resizeRef.handle);
                const isAspectRatio = isFromCorner ? true : resizeState.isShift;
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
                    isFromCorner
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
                let update = false;
                if (!isFromCorner) {
                    const { columnIndex, rowIndex } = getResizeRowAndColumnIndex(resizeRef.element, handleIndex);
                    if (offsetWidth !== 0) {
                        if (!columns[columnIndex].width) {
                            const cellsWithPoints = getCellsWithPoints(board, resizeRef.element);
                            const { minCellWidthInColumn } = cellsWithPoints.reduce(
                                (acc, item) => {
                                    if (item.columnId === columns[columnIndex].id) {
                                        const { width } = RectangleClient.getRectangleByPoints(item.points);
                                        if (!acc.minCellWidthInColumn || width < acc.minCellWidthInColumn) {
                                            acc.minCellWidthInColumn = width;
                                        }
                                    }
                                    return acc;
                                },
                                { minCellWidthInColumn: 0 }
                            );
                            columns[columnIndex] = {
                                ...columns[columnIndex],
                                width: minCellWidthInColumn
                            };
                        }
                        if (offsetWidth + columns[columnIndex].width! > MIN_CELL_SIZE) {
                            columns = calculateRowsOrColumns(columns, offsetWidth, originRect.width, false, false, columnIndex);
                            update = true;
                        }
                    }

                    if (offsetHeight !== 0) {
                        if (!rows[rowIndex].height) {
                            const cellsWithPoints = getCellsWithPoints(board, resizeRef.element);
                            const { minCellHeightInRow } = cellsWithPoints.reduce(
                                (acc, item) => {
                                    if (item.rowId === rows[rowIndex].id) {
                                        const { height } = RectangleClient.getRectangleByPoints(item.points);
                                        if (!acc.minCellHeightInRow || height < acc.minCellHeightInRow) {
                                            acc.minCellHeightInRow = height;
                                        }
                                    }
                                    return acc;
                                },
                                { minCellHeightInRow: 0 }
                            );
                            rows[rowIndex] = {
                                ...rows[rowIndex],
                                height: minCellHeightInRow
                            };
                        }
                        if (offsetHeight + rows[rowIndex].height! > MIN_CELL_SIZE) {
                            rows = calculateRowsOrColumns(rows, offsetHeight, originRect.height, false, true, rowIndex);
                            update = true;
                        }
                    }
                } else {
                    if (offsetWidth !== 0) {
                        columns = calculateRowsOrColumns(columns, offsetWidth, originRect.width, true, false);
                    }
                    if (offsetHeight !== 0) {
                        rows = calculateRowsOrColumns(rows, offsetHeight, originRect.height, true, true);
                    }
                    update = true;
                }
                if (update) {
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
    isFromCorner: boolean,
    isRow: boolean,
    updateIndex?: number
) {
    return data.map((item, index) => {
        const isUpdateIndex = index === updateIndex;
        if (isFromCorner || (isUpdateIndex && !isFromCorner)) {
            const dimension = isRow ? 'height' : 'width';
            if (item[dimension]) {
                const adjustedValue = isFromCorner
                    ? item[dimension]! + offset * (item[dimension]! / originSize)
                    : item[dimension]! + offset;
                return {
                    ...item,
                    [dimension]: adjustedValue
                };
            }
        }
        return item;
    });
}

function getResizeRowAndColumnIndex(element: PlaitBaseTable, handleIndex: number) {
    let columnIndex = 0;
    let rowIndex = 0;
    const { columns, rows } = element;
    if ([Number(ResizeHandle.s), Number(ResizeHandle.e)].includes(handleIndex)) {
        columnIndex = columns.length - 1;
        rowIndex = rows.length - 1;
    }
    return {
        rowIndex,
        columnIndex
    };
}
