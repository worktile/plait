import { PlaitBoard, RectangleClient, Point, createG, drawLine } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PlaitTable, PlaitTableDrawOptions } from '../../interfaces/table';
import { getCellsWithPoints } from '../../utils/table';
import { ShapeEngine } from '../../interfaces';

export const TableEngine: ShapeEngine<PlaitTable, PlaitTableDrawOptions> = {
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
    }
};
