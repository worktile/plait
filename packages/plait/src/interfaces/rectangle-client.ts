import { Point } from './point';

export interface RectangleClient {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const RectangleClient = {
    isHit: (origin: RectangleClient, target: RectangleClient) => {
        const minX = origin.x < target.x ? origin.x : target.x;
        const maxX = origin.x + origin.width > target.x + target.width ? origin.x + origin.width : target.x + target.width;
        const minY = origin.y < target.y ? origin.y : target.y;
        const maxY = origin.y + origin.height > target.y + target.height ? origin.y + origin.height : target.y + target.height;
        // float calculate error( eg: 1.4210854715202004e-14 > 0)
        if (Math.floor(maxX - minX - origin.width - target.width) <= 0 && Math.floor(maxY - minY - origin.height - target.height) <= 0) {
            return true;
        } else {
            return false;
        }
    },
    toRectangleClient: (points: [Point, Point]) => {
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
            width: rectangle.width + Math.abs(offset) * 2,
            height: rectangle.height + Math.abs(offset) * 2
        };
    }
};
