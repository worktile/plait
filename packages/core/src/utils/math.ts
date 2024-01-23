import { Point } from '../interfaces';
import { RectangleClient } from '../interfaces/rectangle-client';

// https://stackoverflow.com/a/6853926/232122
export function distanceBetweenPointAndSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.hypot(dx, dy);
}

export function getNearestPointBetweenPointAndSegment(point: Point, linePoints: [Point, Point]) {
    const x = point[0],
        y = point[1],
        x1 = linePoints[0][0],
        y1 = linePoints[0][1],
        x2 = linePoints[1][0],
        y2 = linePoints[1][1];
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return [xx, yy] as Point;
}

export function distanceBetweenPointAndSegments(points: Point[], point: Point) {
    const len = points.length;
    let distance = Infinity;
    for (let i = 0; i < len - 1; i++) {
        const p = points[i];
        const p2 = points[i + 1];
        const currentDistance = distanceBetweenPointAndSegment(point[0], point[1], p[0], p[1], p2[0], p2[1]);
        if (currentDistance < distance) {
            distance = currentDistance;
        }
    }
    return distance;
}

export function getNearestPointBetweenPointAndSegments(point: Point, points: Point[], isClose: Boolean = true) {
    const len = points.length;
    let distance = Infinity;
    let result: Point = point;

    for (let i = 0; i < len; i++) {
        const p = points[i];
        if (i === len - 1 && !isClose) continue;
        const p2 = i === len - 1 ? points[0] : points[i + 1];
        const currentDistance = distanceBetweenPointAndSegment(point[0], point[1], p[0], p[1], p2[0], p2[1]);
        if (currentDistance < distance) {
            distance = currentDistance;
            result = getNearestPointBetweenPointAndSegment(point, [p, p2]);
        }
    }
    return result;
}

export function rotate(x1: number, y1: number, x2: number, y2: number, angle: number) {
    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
    return [(x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2, (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2];
}

export function distanceBetweenPointAndPoint(x1: number, y1: number, x2: number, y2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.hypot(dx, dy);
}

// https://stackoverflow.com/questions/5254838/calculating-distance-between-a-point-and-a-rectangular-box-nearest-point
export function distanceBetweenPointAndRectangle(x: number, y: number, rect: RectangleClient) {
    var dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
    var dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
    return Math.sqrt(dx * dx + dy * dy);
}

export const isLineHitLine = (a: Point, b: Point, c: Point, d: Point): boolean => {
    const crossProduct = (v1: Point, v2: Point) => v1[0] * v2[1] - v1[1] * v2[0];

    const ab: Point = [b[0] - a[0], b[1] - a[1]];
    const ac: Point = [c[0] - a[0], c[1] - a[1]];
    const ad: Point = [d[0] - a[0], d[1] - a[1]];

    const ca: Point = [a[0] - c[0], a[1] - c[1]];
    const cb: Point = [b[0] - c[0], b[1] - c[1]];
    const cd: Point = [d[0] - c[0], d[1] - c[1]];

    return crossProduct(ab, ac) * crossProduct(ab, ad) <= 0 && crossProduct(cd, ca) * crossProduct(cd, cb) <= 0;
};

export const isPolylineHitRectangle = (points: Point[], rectangle: RectangleClient) => {
    const rectanglePoints = RectangleClient.getCornerPoints(rectangle);

    for (let i = 1; i < points.length; i++) {
        const isIntersect =
            isLineHitLine(points[i], points[i - 1], rectanglePoints[0], rectanglePoints[1]) ||
            isLineHitLine(points[i], points[i - 1], rectanglePoints[1], rectanglePoints[2]) ||
            isLineHitLine(points[i], points[i - 1], rectanglePoints[2], rectanglePoints[3]) ||
            isLineHitLine(points[i], points[i - 1], rectanglePoints[3], rectanglePoints[0]);
        if (isIntersect) {
            return true;
        }
    }

    return false;
};

//https://stackoverflow.com/questions/22521982/check-if-point-is-inside-a-polygon
export const isPointInPolygon = (point: Point, points: Point[]) => {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

    const x = point[0],
        y = point[1];

    let inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        let xi = points[i][0],
            yi = points[i][1];
        let xj = points[j][0],
            yj = points[j][1];

        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
};

export const isPointInEllipse = (point: Point, center: Point, rx: number, ry: number, rotation = 0) => {
    const cosAngle = Math.cos(rotation);
    const sinAngle = Math.sin(rotation);
    const x1 = (point[0] - center[0]) * cosAngle + (point[1] - center[1]) * sinAngle;
    const y1 = (point[1] - center[1]) * cosAngle - (point[0] - center[0]) * sinAngle;

    return (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry) <= 1;
};

export const isPointInRoundRectangle = (point: Point, rectangle: RectangleClient, radius: number) => {
    const { x: rectX, y: rectY, width, height } = rectangle;
    const isInRectangle = point[0] >= rectX && point[0] <= rectX + width && point[1] >= rectY && point[1] <= rectY + height;
    const handleLeftTop =
        point[0] >= rectX &&
        point[0] <= rectX + radius &&
        point[1] >= rectY &&
        point[1] <= rectY + radius &&
        Math.hypot(point[0] - (rectX + radius), point[1] - (rectY + radius)) > radius;
    const handleLeftBottom =
        point[0] >= rectX &&
        point[0] <= rectX + radius &&
        point[1] >= rectY + height &&
        point[1] <= rectY + height - radius &&
        Math.hypot(point[0] - (rectX + radius), point[1] - (rectY + height - radius)) > radius;
    const handleRightTop =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY &&
        point[1] <= rectY + radius &&
        Math.hypot(point[0] - (rectX + width - radius), point[1] - (rectY + radius)) > radius;
    const handleRightBottom =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY + height - radius &&
        point[1] <= rectY + height &&
        Math.hypot(point[0] - (rectX + width - radius), point[1] - (rectY + height - radius)) > radius;
    const isInCorner = handleLeftTop || handleLeftBottom || handleRightTop || handleRightBottom;

    return isInRectangle && !isInCorner;
};

export const downScale = (number: number) => {
    return Number(number.toFixed(2));
};

// https://gist.github.com/nicholaswmin/c2661eb11cad5671d816
export const catmullRomFitting = function(points: Point[]) {
    const alpha = 0.5;
    let p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
    var d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
    const result: Point[] = [];
    result.push([Math.round(points[0][0]), Math.round(points[0][1])]);
    var length = points.length;
    for (var i = 0; i < length - 1; i++) {
        p0 = i == 0 ? points[0] : points[i - 1];
        p1 = points[i];
        p2 = points[i + 1];
        p3 = i + 2 < length ? points[i + 2] : p2;

        d1 = Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
        d2 = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        d3 = Math.sqrt(Math.pow(p2[0] - p3[0], 2) + Math.pow(p2[1] - p3[1], 2));

        // Catmull-Rom to Cubic Bezier conversion matrix
        // A = 2d1^2a + 3d1^a * d2^a + d3^2a
        // B = 2d3^2a + 3d3^a * d2^a + d2^2a
        // [   0             1            0          0          ]
        // [   -d2^2a /N     A/N          d1^2a /N   0          ]
        // [   0             d3^2a /M     B/M        -d2^2a /M  ]
        // [   0             0            1          0          ]

        d3powA = Math.pow(d3, alpha);
        d3pow2A = Math.pow(d3, 2 * alpha);
        d2powA = Math.pow(d2, alpha);
        d2pow2A = Math.pow(d2, 2 * alpha);
        d1powA = Math.pow(d1, alpha);
        d1pow2A = Math.pow(d1, 2 * alpha);

        A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
        B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
        N = 3 * d1powA * (d1powA + d2powA);
        if (N > 0) {
            N = 1 / N;
        }
        M = 3 * d3powA * (d3powA + d2powA);
        if (M > 0) {
            M = 1 / M;
        }

        bp1 = [(-d2pow2A * p0[0] + A * p1[0] + d1pow2A * p2[0]) * N, (-d2pow2A * p0[1] + A * p1[1] + d1pow2A * p2[1]) * N];
        bp2 = [(d3pow2A * p1[0] + B * p2[0] - d2pow2A * p3[0]) * M, (d3pow2A * p1[1] + B * p2[1] - d2pow2A * p3[1]) * M];

        if (bp1[0] == 0 && bp1[1] == 0) {
            bp1 = p1;
        }
        if (bp2[0] == 0 && bp2[1] == 0) {
            bp2 = p2;
        }

        result.push(bp1 as Point, bp2 as Point, p2 as Point);
    }

    return result;
};

/**
 * the result of slope is based on Cartesian coordinate system
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getEllipseTangentSlope(x: number, y: number, a: number, b: number) {
    if (Math.abs(y) === 0) {
        return x > 0 ? -Infinity : Infinity;
    }
    const k = (-b * b * x) / (a * a * y);
    return k;
}

/**
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getVectorFromPointAndSlope(x: number, y: number, slope: number) {
    if (slope === Infinity) {
        return [0, -1] as Point;
    } else if (slope === -Infinity) {
        return [0, 1] as Point;
    }
    let vector = [1, -slope] as Point;
    if (y < 0) {
        vector = [-vector[0], -vector[1]];
    }
    return vector as Point;
}

export function isHorizontalSegment(points: Point[], tolerance: number = 0) {
    return points.every(point => Math.abs(point[1] - points[0][1]) <= tolerance);
}

export function isVerticalSegment(points: Point[], tolerance: number = 0) {
    return points.every(point => Math.abs(point[0] - points[0][0]) <= tolerance);
}

export function isPointsOnSameLine(points: Point[], tolerance: number = 0) {
    return isHorizontalSegment(points, tolerance) || isVerticalSegment(points, tolerance);
}
