import { PlaitBoard, RectangleClient, Point, createG, PlaitElement, drawLine } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitTable } from '../../interfaces/table';

import { ShapeEngine } from '../../interfaces';
import { getCellsWithPoints } from '../../utils/table';

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
    }
};
