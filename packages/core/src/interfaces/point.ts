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
    }
};
