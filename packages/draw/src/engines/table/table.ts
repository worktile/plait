import { PlaitBoard, RectangleClient, Point, createG, drawLine, setStrokeLinecap, drawRectangle, ACTIVE_STROKE_WIDTH } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { getCellsWithPoints, getCellWithPoints } from '../../utils/table';
import { ShapeEngine } from '../../interfaces';
import { DrawTextInfo } from '../../generators/text.generator';
import { PlaitTable, PlaitTableCellWithPoints, PlaitTableDrawOptions, PlaitTableElement } from '../../interfaces/table';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getNearestPointBetweenPointAndRoundRectangle, getRoundRectangleRadius } from '../basic-shapes/round-rectangle';
import { getTextSize } from '../../utils/text-size';

export const TableEngine: ShapeEngine<PlaitTable, PlaitTableDrawOptions, DrawTextInfo> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, roughOptions: Options, options?: PlaitTableDrawOptions) {
        const g = createG();
        try {
            const pointCells = getCellsWithPoints(board, { ...options?.element } as PlaitTable);
            if (pointCells) {
                const rs = PlaitBoard.getRoughSVG(board);
                const { x, y, width, height } = rectangle;
                const tableTopBorder = drawLine(rs, [x, y], [x + width, y], roughOptions);
                const tableLeftBorder = drawLine(rs, [x, y], [x, y + height], roughOptions);
                g.append(tableTopBorder, tableLeftBorder);
                pointCells.forEach((cell) => {
                    const rectangle = RectangleClient.getRectangleByPoints(cell.points!);
                    const { x, y, width, height } = rectangle;
                    const cellRectangle = drawRectangle(
                        board,
                        {
                            x: x + ACTIVE_STROKE_WIDTH,
                            y: y + ACTIVE_STROKE_WIDTH,
                            width: width - ACTIVE_STROKE_WIDTH * 2,
                            height: height - ACTIVE_STROKE_WIDTH * 2
                        },
                        { fill: cell.fill, fillStyle: 'solid', strokeWidth: 0 }
                    );
                    const cellRightBorder = drawLine(rs, [x + width, y], [x + width, y + height], roughOptions);
                    const cellBottomBorder = drawLine(rs, [x, y + height], [x + width, y + height], roughOptions);
                    g.append(cellRectangle, cellRightBorder, cellBottomBorder);
                });
                setStrokeLinecap(g, 'round');
            }
        } catch (error) {
            console.error(error);
        }
        return g;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        return getNearestPointBetweenPointAndRoundRectangle(point, rectangle, getRoundRectangleRadius(rectangle));
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(board: PlaitBoard, element: PlaitTable, options?: DrawTextInfo) {
        try {
            if (options && options.id) {
                const cell = getCellWithPoints(board, element, options!.id);
                if (cell) {
                    if (PlaitTableElement.isVerticalText(cell)) {
                        return getVerticalTextRectangle(board, cell);
                    } else {
                        return getHorizontalTextRectangle(board, cell);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }
};

export function getVerticalTextRectangle(board: PlaitBoard, cell: PlaitTableCellWithPoints) {
    const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
    const strokeWidth = getStrokeWidthByElement(cell);
    const width = cellRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return getTextRectangle(board, cell, width, cellRectangle);
}

export function getHorizontalTextRectangle(board: PlaitBoard, cell: PlaitTableCellWithPoints) {
    const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
    const strokeWidth = getStrokeWidthByElement(cell);
    const width = cellRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return getTextRectangle(board, cell, width, cellRectangle);
}

export function getTextRectangle(board: PlaitBoard, cell: PlaitTableCellWithPoints, width: number, cellRectangle: RectangleClient) {
    const text = cell.text;
    if (text) {
        const textSize = getTextSize(board, text, width);
        return {
            width: width > 0 ? width : 0,
            height: textSize.height,
            x: cellRectangle.x - width / 2 + cellRectangle.width / 2,
            y: cellRectangle.y + (cellRectangle.height - textSize.height) / 2
        };
    } else {
        return {
            width: 0,
            height: 0,
            x: cellRectangle.x,
            y: cellRectangle.y
        };
    }
}

export const getCellTextHeight = (board: PlaitBoard, cell: PlaitTableCellWithPoints, isVertical: boolean = false) => {
    if (cell.text) {
        const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
        const strokeWidth = getStrokeWidthByElement(cell);
        let width = cellRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        if (isVertical) {
            width = cellRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        }
        return getTextSize(board, cell.text, width).height;
    }
    return 0;
};
