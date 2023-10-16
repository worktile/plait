export type Point = [number, number];

export interface XYPosition {
    x: number;
    y: number;
}

export const Point = {
    isEquals(point?: Point, otherPoint?: Point) {
        return point && otherPoint && point[0] === otherPoint[0] && point[1] === otherPoint[1];
    }
};
