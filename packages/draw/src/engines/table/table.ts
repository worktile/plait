import { PlaitBoard, RectangleClient, Point, createG, PlaitElement, drawLine } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitTable, PlaitTableCell, PlaitTableElement } from '../../interfaces/table';

import { ShapeEngine } from '../../interfaces';
import { getCellsWithPoints } from '../../utils/table';
import { getStrokeWidthByElement, getTextRectangle } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';

export const TableEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options, element?: PlaitElement) {
        const rs = PlaitBoard.getRoughSVG(board);
        const g = createG();
        const { x, y, width, height } = rectangle;
        const tableTopBorder = drawLine(rs, [x, y], [x + width, y], options);
        const tableLeftBorder = drawLine(rs, [x, y], [x, y + height], options);
        g.append(tableTopBorder, tableLeftBorder);
        const pointCells = getCellsWithPoints({ ...element } as PlaitTable);
        pointCells.forEach(cell => {
            const rectangle = RectangleClient.getRectangleByPoints(cell.points!);
            const { x, y, width, height } = rectangle;
            const cellRightBorder = drawLine(rs, [x + width, y], [x + width, y + height], options);
            const cellBottomBorder = drawLine(rs, [x, y + height], [x + width, y + height], options);
            g.append(cellRightBorder, cellBottomBorder);
        });
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
        return [0, 0];
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitElement) {
        if (PlaitTableElement.isVerticalCell(element as PlaitTableCell)) {
            const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
            const strokeWidth = getStrokeWidthByElement(element);
            const height = elementRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            const width = element.textHeight;
            return {
                width,
                height: height > 0 ? height : 0,
                x: elementRectangle.x + (elementRectangle.width - width) / 2,
                y: elementRectangle.y + ShapeDefaultSpace.rectangleAndText + strokeWidth
            };
        }
        return getTextRectangle(element);
    }
};
