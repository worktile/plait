export type Point = [number, number];

export interface XYPosition {
    x: number;
    y: number;
}

export const Point = {
    isEquals(point?: Point, otherPoint?: Point) {
        return point && otherPoint && point[0] === otherPoint[0] && point[1] === otherPoint[1];
    },
    isHorizontalAlign(point?: Point, otherPoint?: Point, tolerance = 0) {
        return point && otherPoint && Math.abs(point[1] - otherPoint[1]) <= tolerance;
    },
    isVerticalAlign(point?: Point, otherPoint?: Point, tolerance = 0) {
        return point && otherPoint && Math.abs(point[0] - otherPoint[0]) <= tolerance;
    },
    getOffsetX(point1: Point, point2: Point) {
        return point2[0] - point1[0];
    },
    getOffsetY(point1: Point, point2: Point) {
        return point2[1] - point1[1];
    }
};
