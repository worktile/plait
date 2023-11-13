import { Point } from './point';

export interface RectangleClient {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * [x, y] x,y between 0 and 1
 * represents a point in the rectangle
 */
export type PointOfRectangle = [number, number];

export const RectangleClient = {
    isHit: (origin: RectangleClient, target: RectangleClient) => {
        return RectangleClient.isHitX(origin, target) && RectangleClient.isHitY(origin, target);
    },
    isHitX: (origin: RectangleClient, target: RectangleClient) => {
        const minX = origin.x < target.x ? origin.x : target.x;
        const maxX = origin.x + origin.width > target.x + target.width ? origin.x + origin.width : target.x + target.width;
        // float calculate error( eg: 1.4210854715202004e-14 > 0)
        if (Math.floor(maxX - minX - origin.width - target.width) <= 0) {
            return true;
        } else {
            return false;
        }
    },
    isHitY: (origin: RectangleClient, target: RectangleClient) => {
        const minY = origin.y < target.y ? origin.y : target.y;
        const maxY = origin.y + origin.height > target.y + target.height ? origin.y + origin.height : target.y + target.height;
        // float calculate error( eg: 1.4210854715202004e-14 > 0)
        if (Math.floor(maxY - minY - origin.height - target.height) <= 0) {
            return true;
        } else {
            return false;
        }
    },
    toRectangleClient: (points: Point[]) => {
        const xArray = points.map(ele => ele[0]);
        const yArray = points.map(ele => ele[1]);
        const xMin = Math.min(...xArray);
        const xMax = Math.max(...xArray);
        const yMin = Math.min(...yArray);
        const yMax = Math.max(...yArray);
        const rect = { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
        return rect;
    },
    getOutlineRectangle: (rectangle: RectangleClient, offset: number) => {
        return {
            x: rectangle.x + offset,
            y: rectangle.y + offset,
            width: rectangle.width - offset * 2,
            height: rectangle.height - offset * 2
        };
    },
    inflate: (rectangle: RectangleClient, delta: number) => {
        const half = delta / 2;
        return {
            x: rectangle.x - half,
            y: rectangle.y - half,
            width: rectangle.width + half * 2,
            height: rectangle.height + half * 2
        };
    },
    isEqual: (rectangle: RectangleClient, otherRectangle: RectangleClient) => {
        return (
            rectangle.x === otherRectangle.x &&
            rectangle.y === otherRectangle.y &&
            rectangle.width === otherRectangle.width &&
            rectangle.height === otherRectangle.height
        );
    },
    getCornerPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height]
        ] as [Point, Point, Point, Point];
    },
    getEdgeCenterPoints: (rectangle: RectangleClient) => {
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [rectangle.x, rectangle.y + rectangle.height / 2]
        ] as [Point, Point, Point, Point];
    },
    getConnectionPoint: (rectangle: RectangleClient, point: PointOfRectangle) => {
        return [rectangle.x + rectangle.width * point[0], rectangle.y + rectangle.height * point[1]] as Point;
    }
};
