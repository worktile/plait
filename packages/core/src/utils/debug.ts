import { Options } from 'roughjs/bin/core';
import { PlaitBoard, Point, RectangleClient } from '../interfaces';

const TEMPORARY_G = new Map();

const getTemporaryGArray = (debugKey: string): SVGGElement[] => {
    return TEMPORARY_G.get(debugKey) || [];
};

const setTemporaryGArray = (debugKey: string, gArray: SVGGElement[]) => {
    TEMPORARY_G.set(debugKey, gArray);
};

export class DebugGenerator {
    constructor(private debugKey: string) {}
    isDebug() {
        return isDebug(this.debugKey);
    }
    clear() {
        if (!this.isDebug()) {
            return;
        }
        const gArray = getTemporaryGArray(this.debugKey);
        setTemporaryGArray(this.debugKey, []);
        gArray.forEach(g => g.remove());
    }
    drawPolygon(board: PlaitBoard, points: Point[], options?: Options) {
        if (!isDebug(this.debugKey)) {
            return;
        }
        const polygonG = PlaitBoard.getRoughSVG(board).polygon(points, options || { stroke: 'red' });
        PlaitBoard.getElementActiveHost(board).append(polygonG);
        const gArray = getTemporaryGArray(this.debugKey);
        gArray.push(polygonG);
        setTemporaryGArray(this.debugKey, gArray);
        return polygonG;
    }
    drawRectangle(board: PlaitBoard, data: Point[] | RectangleClient, options?: Options) {
        if (!isDebug(this.debugKey)) {
            return;
        }
        let rectangle: RectangleClient;
        if (data instanceof Array) {
            rectangle = RectangleClient.getRectangleByPoints(data);
        } else {
            rectangle = data;
        }
        const rectangleG = PlaitBoard.getRoughSVG(board).rectangle(
            rectangle.x,
            rectangle.y,
            rectangle.width,
            rectangle.height,
            options || { stroke: 'red' }
        );
        PlaitBoard.getElementActiveHost(board).append(rectangleG);
        const gArray = getTemporaryGArray(this.debugKey);
        gArray.push(rectangleG);
        setTemporaryGArray(this.debugKey, gArray);
        return rectangleG;
    }
    drawCircles(board: PlaitBoard, points: Point[], diameter: number = 0, isCumulativeDiameter: boolean = false, options?: Options) {
        if (!isDebug(this.debugKey)) {
            return;
        }
        const result: SVGGElement[] = [];
        points.forEach((p, i) => {
            const circle = PlaitBoard.getRoughSVG(board).circle(
                p[0],
                p[1],
                isCumulativeDiameter ? diameter * (i + 1) : diameter,
                Object.assign({}, { stroke: 'red', fill: 'red', fillStyle: 'solid' }, options || {})
            );
            PlaitBoard.getElementActiveHost(board).append(circle);
            const gArray = getTemporaryGArray(this.debugKey);
            gArray.push(circle);
            result.push(circle);
            setTemporaryGArray(this.debugKey, gArray);
        });
        return result;
    }
}

export const createDebugGenerator = (debugKey: string) => {
    return new DebugGenerator(debugKey);
};

export const isDebug = (key?: string) => {
    const defaultKey = 'debug:plait';
    return localStorage.getItem(key || defaultKey) === 'true';
};
