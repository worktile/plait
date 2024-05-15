import { PlaitBoard, RectangleClient, Point, createG, drawLine } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { getCellsWithPoints } from '../../utils/table';
import { ShapeEngine } from '../../interfaces';
import { PlaitDrawShapeText } from '../../generators/text.generator';
import { PlaitTable, PlaitTableDrawOptions, PlaitTableElement } from '../../interfaces/table';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';


export const TableEngine: ShapeEngine<PlaitTable, PlaitTableDrawOptions, PlaitDrawShapeText> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, roughOptions: Options, options?: PlaitTableDrawOptions) {
        const rs = PlaitBoard.getRoughSVG(board);
        const g = createG();
        const { x, y, width, height } = rectangle;
        const tableTopBorder = drawLine(rs, [x, y], [x + width, y], roughOptions);
        const tableLeftBorder = drawLine(rs, [x, y], [x, y + height], roughOptions);
        g.append(tableTopBorder, tableLeftBorder);
        const pointCells = getCellsWithPoints({ ...options?.element } as PlaitTable);
        pointCells.forEach(cell => {
            const rectangle = RectangleClient.getRectangleByPoints(cell.points!);
            const { x, y, width, height } = rectangle;
            const cellRightBorder = drawLine(rs, [x + width, y], [x + width, y + height], roughOptions);
            const cellBottomBorder = drawLine(rs, [x, y + height], [x + width, y + height], roughOptions);
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
    getTextRectangle(element: PlaitTable, options?: PlaitDrawShapeText) {
        const cells = getCellsWithPoints(element);
        const cellIndex = element.cells.findIndex(item => item.id === options!.key);
        const cell = cells[cellIndex];
        const cellRectangle = RectangleClient.getRectangleByPoints(cell.points);
        const strokeWidth = getStrokeWidthByElement(cell);
        const height = cell.textHeight || 0;
        if (PlaitTableElement.isVerticalText(cell)) {
            const width = cellRectangle.height - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            return {
                width: width > 0 ? width : 0,
                height,
                x: cellRectangle.x - width / 2 + cellRectangle.width / 2,
                y: cellRectangle.y + (cellRectangle.height - height) / 2
            };
        } else {
            const width = cellRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            return {
                height,
                width: width > 0 ? width : 0,
                x: cellRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: cellRectangle.y + (cellRectangle.height - height) / 2
            };
        }
    }
};
