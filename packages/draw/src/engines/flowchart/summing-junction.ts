import { PlaitBoard, RectangleClient, Point } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getTextRectangle } from '../../utils';
import { createCircleEngine } from '../basic-shapes/circle';

export const SummingJunctionEngine: ShapeEngine = createCircleEngine({
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
    },
    getTextRectangle(element: PlaitGeometry) {
        const rectangle = getTextRectangle(element);
        rectangle.width = 0;
        rectangle.height = 0;
        return rectangle;
    }
});

// https://medium.com/@steveruiz/find-the-points-where-a-line-segment-intercepts-an-angled-ellipse-in-javascript-typescript-e451524beece
export function getCrossingPointsBetweenEllipseAndSegment(
    startPoint: Point,
    endPoint: Point,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    segment_only = true
) {
    // If the ellipse or line segment are empty, return no tValues.
    if (rx === 0 || ry === 0 || (startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1])) {
        return [];
    }

    rx = rx < 0 ? rx : -rx;
    ry = ry < 0 ? ry : -ry;

    startPoint[0] -= cx;
    startPoint[1] -= cy;
    endPoint[0] -= cx;
    endPoint[1] -= cy;

    // Calculate the quadratic parameters.
    var A =
        ((endPoint[0] - startPoint[0]) * (endPoint[0] - startPoint[0])) / rx / rx +
        ((endPoint[1] - startPoint[1]) * (endPoint[1] - startPoint[1])) / ry / ry;
    var B = (2 * startPoint[0] * (endPoint[0] - startPoint[0])) / rx / rx + (2 * startPoint[1] * (endPoint[1] - startPoint[1])) / ry / ry;
    var C = (startPoint[0] * startPoint[0]) / rx / rx + (startPoint[1] * startPoint[1]) / ry / ry - 1;

    // Make a list of t values (normalized points on the line where intersections occur).
    var tValues: number[] = [];

    // Calculate the discriminant.
    var discriminant = B * B - 4 * A * C;

    if (discriminant === 0) {
        // One real solution.
        tValues.push(-B / 2 / A);
    } else if (discriminant > 0) {
        // Two real solutions.
        tValues.push((-B + Math.sqrt(discriminant)) / 2 / A);
        tValues.push((-B - Math.sqrt(discriminant)) / 2 / A);
    }
    return (
        tValues
            // Filter to only points that are on the segment.
            .filter(t => !segment_only || (t >= 0 && t <= 1))
            // Solve for points.
            .map(t => [startPoint[0] + (endPoint[0] - startPoint[0]) * t + cx, startPoint[1] + (endPoint[1] - startPoint[1]) * t + cy])
    );
}
