import { PlaitBoard, RectangleClient, Point, createG, drawLine, setStrokeLinecap, drawRectangle, ACTIVE_STROKE_WIDTH } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { getCellsWithPoints, getCellWithPoints } from '../../utils/table';
import { ShapeEngine } from '../../interfaces';
import { PlaitDrawShapeText } from '../../generators/text.generator';
import { PlaitTable, PlaitTableCellWithPoints, PlaitTableDrawOptions, PlaitTableElement } from '../../interfaces/table';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getNearestPointBetweenPointAndRoundRectangle, getRoundRectangleRadius } from '../basic-shapes/round-rectangle';

export const TableEngine: ShapeEngine<PlaitTable, PlaitTableDrawOptions, PlaitDrawShapeText> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, roughOptions: Options, options?: PlaitTableDrawOptions) {
        const rs = PlaitBoard.getRoughSVG(board);
        const g = createG();
        const { x, y, width, height } = rectangle;
        const tableTopBorder = drawLine(rs, [x, y], [x + width, y], roughOptions);
        const tableLeftBorder = drawLine(rs, [x, y], [x, y + height], roughOptions);
        g.append(tableTopBorder, tableLeftBorder);
        const pointCells = getCellsWithPoints(board, { ...options?.element } as PlaitTable);
        pointCells.forEach(cell => {
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
    getTextRectangle(element: PlaitTable, options?: PlaitDrawShapeText) {
        const cell = getCellWithPoints(options?.board!, element, options!.key);
        if (PlaitTableElement.isVerticalText(cell)) {
            return getVerticalTextRectangle(cell);
        } else {
            return getHorizontalTextRectangle(cell);
        }
    }
};

export function getVerticalTextRectangle(cell: PlaitTableCellWithPoints) {
    const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
    const strokeWidth = getStrokeWidthByElement(cell);
    const height = cell.textHeight || 0;
    const width = cellRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return {
        width: width > 0 ? width : 0,
        height,
        x: cellRectangle.x - width / 2 + cellRectangle.width / 2,
        y: cellRectangle.y + (cellRectangle.height - height) / 2
    };
}

export function getHorizontalTextRectangle(cell: PlaitTableCellWithPoints) {
    const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
    const strokeWidth = getStrokeWidthByElement(cell);
    const height = cell.textHeight || 0;
    const width = cellRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
    return {
        height,
        width: width > 0 ? width : 0,
        x: cellRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
        y: cellRectangle.y + (cellRectangle.height - height) / 2
    };
}
