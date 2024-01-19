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
    getPoints(rectangle: RectangleClient) {
        return [
            [rectangle.x, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height]
        ] as [Point, Point];
    },
    createRectangleByCenterPoint(point: Point, width: number, height: number) {
        return RectangleClient.createRectangleClient([point[0] - width / 2, point[1] - height / 2], width, height);
    },
    createRectangleClient(point: Point, width: number, height: number): RectangleClient {
        return {
            x: point[0],
            y: point[1],
            width,
            height
        };
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
    getCenterPoint: (rectangle: RectangleClient) => {
        return [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height / 2] as Point;
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
    },
    expand(rectangle: RectangleClient, left: number, top: number = left, right: number = left, bottom: number = top) {
        return {
            x: rectangle.x - left,
            y: rectangle.y - top,
            width: rectangle.width + left + right,
            height: rectangle.height + top + bottom
        };
    },
    getGapCenter(rectangle1: RectangleClient, rectangle2: RectangleClient, isHorizontal: boolean) {
        const axis = isHorizontal ? 'x' : 'y';
        const side = isHorizontal ? 'width' : 'height';
        const align = [rectangle1[axis], rectangle1[axis] + rectangle1[side], rectangle2[axis], rectangle2[axis] + rectangle2[side]];
        const sortArr = align.sort((a, b) => a - b);
        return (sortArr[1] + sortArr[2]) / 2;
    },
    isPointInRectangle(rectangle: RectangleClient, point: Point) {
        const x = point[0],
            y = point[1];
        return x > rectangle.x && x < rectangle.x + rectangle.width && y > rectangle.y && y < rectangle.y + rectangle.height;
    },
    getBoundingRectangle(rectangles: RectangleClient[]): RectangleClient {
        if (rectangles.length === 0) {
            throw new Error('rectangles can not be empty array');
        }
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;
        rectangles.forEach(rect => {
            minX = Math.min(minX, rect.x);
            minY = Math.min(minY, rect.y);
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
};
