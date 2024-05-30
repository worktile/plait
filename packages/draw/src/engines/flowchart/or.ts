import { PlaitBoard, RectangleClient } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getTextRectangle } from '../../utils';
import { createEllipseEngine } from '../basic-shapes/ellipse';

export const OrEngine: ShapeEngine = createEllipseEngine({
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const rx = rectangle.width / 2;
        const ry = rectangle.height / 2;
        const startPoint = [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2];
        return rs.path(
            `M${startPoint[0]} ${startPoint[1]}
        A${rx},${ry} 0 1,1 ${startPoint[0]} ${startPoint[1] - 0.01}
        M${rectangle.x} ${rectangle.y + rectangle.height / 2}
        L${rectangle.x + rectangle.width} ${rectangle.y + rectangle.height / 2}
        M${rectangle.x + rectangle.width / 2} ${rectangle.y}
        L${rectangle.x + rectangle.width / 2} ${rectangle.y + rectangle.height}
        `,
            { ...options, fillStyle: 'solid' }
        );
    }
});
