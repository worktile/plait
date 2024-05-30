import { PlaitBoard, RectangleClient, getCrossingPointsBetweenEllipseAndSegment } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getTextRectangle } from '../../utils';
import { createEllipseEngine } from '../basic-shapes/ellipse';

export const SummingJunctionEngine: ShapeEngine = createEllipseEngine({
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const rx = rectangle.width / 2;
        const ry = rectangle.height / 2;
        const startPoint = [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2];
        const centerPoint = [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2];
        const line1Points = getCrossingPointsBetweenEllipseAndSegment(
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
            centerPoint[0],
            centerPoint[1],
            rx,
            ry
        );
        const line2Points = getCrossingPointsBetweenEllipseAndSegment(
            [rectangle.x + rectangle.width, rectangle.y],
            [rectangle.x, rectangle.y + rectangle.height],
            centerPoint[0],
            centerPoint[1],
            rx,
            ry
        );

        return rs.path(
            `M${startPoint[0]} ${startPoint[1]}
        A${rx},${ry} 0 1,1 ${startPoint[0]} ${startPoint[1] - 0.01}
        M${line1Points[0][0]} ${line1Points[0][1]}
        L${line1Points[1][0]} ${line1Points[1][1]}
        M${line2Points[0][0]} ${line2Points[0][1]}
        L${line2Points[1][0]} ${line2Points[1][1]}
        `,
            { ...options, fillStyle: 'solid' }
        );
    }
});
