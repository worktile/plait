export type Point = [number, number];

export interface XYPosition {
    x: number;
    y: number;
}

export const Point = {
    isEquals(point?: Point, otherPoint?: Point) {
        return point && otherPoint && point[0] === otherPoint[0] && point[1] === otherPoint[1];
    },
    isHorizontal(point?: Point, otherPoint?: Point, tolerance = 0) {
        return point && otherPoint && Point.isOverHorizontal([point, otherPoint], tolerance);
    },
    isOverHorizontal(points: Point[], tolerance: number = 0) {
        return points.every(point => Math.abs(point[1] - points[0][1]) <= tolerance);
    },
    isVertical(point?: Point, otherPoint?: Point, tolerance = 0) {
        return point && otherPoint && Point.isOverVertical([point, otherPoint], tolerance);
    },
    isOverVertical(points: Point[], tolerance: number = 0) {
        return points.every(point => Math.abs(point[0] - points[0][0]) <= tolerance);
    },
    isAlign(points: Point[], tolerance: number = 0) {
        return Point.isOverHorizontal(points, tolerance) || Point.isOverVertical(points, tolerance);
    },
    getOffsetX(point1: Point, point2: Point) {
        return point2[0] - point1[0];
    },
    getOffsetY(point1: Point, point2: Point) {
        return point2[1] - point1[1];
    }
};
