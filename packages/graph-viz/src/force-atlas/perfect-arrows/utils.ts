// Credits to perfect-arrows
// https://github.com/steveruizok/perfect-arrows/blob/master/src/lib/utils.ts

const PI = Math.PI;

/**
 * Modulate a value between two ranges.
 * @param value
 * @param rangeA from [low, high]
 * @param rangeB to [low, high]
 * @param clamp
 */
export function modulate(value: number, rangeA: number[], rangeB: number[], clamp = false) {
    const [fromLow, fromHigh] = rangeA;
    const [toLow, toHigh] = rangeB;
    const result = toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow);
    if (clamp === true) {
        if (toLow < toHigh) {
            if (result < toLow) {
                return toLow;
            }
            if (result > toHigh) {
                return toHigh;
            }
        } else {
            if (result > toLow) {
                return toLow;
            }
            if (result < toHigh) {
                return toHigh;
            }
        }
    }
    return result;
}

/**
 * Rotate a point around a center.
 * @param x The x-axis coordinate of the point.
 * @param y The y-axis coordinate of the point.
 * @param cx The x-axis coordinate of the point to rotate round.
 * @param cy The y-axis coordinate of the point to rotate round.
 * @param angle The distance (in radians) to rotate.
 */
export function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    const px = x - cx;
    const py = y - cy;

    const nx = px * c - py * s;
    const ny = px * s + py * c;

    return [nx + cx, ny + cy];
}

/**
 * Get the distance between two points.
 * @param x0 The x-axis coordinate of the first point.
 * @param y0 The y-axis coordinate of the first point.
 * @param x1 The x-axis coordinate of the second point.
 * @param y1 The y-axis coordinate of the second point.
 */
export function getDistance(x0: number, y0: number, x1: number, y1: number) {
    return Math.hypot(y1 - y0, x1 - x0);
}

/**
 * Get an angle (radians) between two points.
 * @param x0 The x-axis coordinate of the first point.
 * @param y0 The y-axis coordinate of the first point.
 * @param x1 The x-axis coordinate of the second point.
 * @param y1 The y-axis coordinate of the second point.
 */
export function getAngle(x0: number, y0: number, x1: number, y1: number) {
    return Math.atan2(y1 - y0, x1 - x0);
}

/**
 * Move a point in an angle by a distance.
 * @param x0
 * @param y0
 * @param a angle (radians)
 * @param d distance
 */
export function projectPoint(x0: number, y0: number, a: number, d: number) {
    return [Math.cos(a) * d + x0, Math.sin(a) * d + y0];
}

/**
 * Get a point between two points.
 * @param x0 The x-axis coordinate of the first point.
 * @param y0 The y-axis coordinate of the first point.
 * @param x1 The x-axis coordinate of the second point.
 * @param y1 The y-axis coordinate of the second point.
 * @param d Normalized
 */
export function getPointBetween(x0: number, y0: number, x1: number, y1: number, d = 0.5) {
    return [x0 + (x1 - x0) * d, y0 + (y1 - y0) * d];
}

/**
 * Get the sector of an angle (e.g. quadrant, octant)
 * @param a The angle to check.
 * @param s The number of sectors to check.
 */
export function getSector(a: number, s = 8) {
    return Math.floor(s * (0.5 + ((a / (PI * 2)) % s)));
}

/**
 * Get a normal value representing how close two points are from being at a 45 degree angle.
 * @param x0 The x-axis coordinate of the first point.
 * @param y0 The y-axis coordinate of the first point.
 * @param x1 The x-axis coordinate of the second point.
 * @param y1 The y-axis coordinate of the second point.
 */
export function getAngliness(x0: number, y0: number, x1: number, y1: number) {
    return Math.abs((x1 - x0) / 2 / ((y1 - y0) / 2));
}
