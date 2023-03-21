import { RoughSVG } from 'roughjs/bin/svg';
import { PRIMARY_COLOR } from '../constants';
import { roughCommonDrawer } from '../drawer/common-drawer';
import { PlaitBoard, PlaitElement, Point } from '../interfaces';
import { invertTransformPoint } from './board';
import { generateKey } from './key';
import { transform } from './viewport';
import { BOARD_TO_ROUGH_SVG } from './weak-maps';

export type NodeListPointer = {
    [key: string]: number;
    right: number;
    left: number;
    up: number;
    down: number;
};

export enum EdgeMode {
    sharp = 'sharp',
    round = 'round'
}
export class Attributes {
    stroke: string = '#0000';
    strokeWidth: number = 1;
    edgeMode: EdgeMode | undefined = EdgeMode.sharp;
    fillStyle?: string = PRIMARY_COLOR;
    fill?: string = PRIMARY_COLOR;
}

export function createRectangle(
    start: Point,
    end: Point,
    stroke: string,
    strokeWidth: number,
    edgeMode: EdgeMode,
    fill?: string,
    fillStyle?: string
): PlaitElement {
    return {
        id: '',
        type: 'rectangle',
        points: [start, end],
        key: generateKey(),
        stroke,
        fill,
        strokeWidth,
        fillStyle,
        edgeMode
    } as PlaitElement;
}

let hostPickSVGG: SVGGElement[] = [];
const attributes: Attributes = { stroke: PRIMARY_COLOR, strokeWidth: 1, edgeMode: EdgeMode.sharp };
export const drawPickBox = (board: PlaitBoard, start: Point, end: Point) => {
    hostPickSVGG = destroyHostSVGG(hostPickSVGG);
    const [xMin, xMax, yMin, yMax] = [
        Math.min(start[0], end[0]),
        Math.max(start[0], end[0]),
        Math.min(start[1], end[1]),
        Math.max(start[1], end[1])
    ];
    const pickStart = invertTransformPoint(board, [xMin, yMax]);
    const pickEnd = invertTransformPoint(board, [xMax, yMin]);
    const tempElement = transform(
        board,
        createRectangle(pickStart, pickEnd, attributes.stroke, attributes.strokeWidth, attributes.edgeMode as EdgeMode)
    );
    const g = roughCommonDrawer.draw(getRoughSVG(board) as RoughSVG, tempElement) as SVGGElement;
    appendHostSVGG(board, g);
    hostPickSVGG = arrayHostSVGG(g);
    return hostPickSVGG;
};

export function getRoughSVG(board: PlaitBoard) {
    const roughSVG = BOARD_TO_ROUGH_SVG.get(board);
    if (!roughSVG) {
        throw new Error('undefined roughSVG');
    }
    return roughSVG;
}

export function destroyHostSVGG(hostSVGG: SVGGElement[]) {
    hostSVGG.forEach(g => g.remove());
    hostSVGG = [];
    return hostSVGG;
}

export function appendHostSVGG(board: PlaitBoard, hostSVGG: SVGGElement[] | SVGGElement) {
    if (Array.isArray(hostSVGG)) {
        hostSVGG.forEach(dom => {
            board.host?.appendChild(dom);
            dom.setAttribute('transform', `translate(${board.viewport.offsetX} ${board.viewport.offsetY})`);
        });
    } else {
        board.host?.appendChild(hostSVGG);
        hostSVGG.setAttribute('transform', `translate(${board.viewport.offsetX} ${board.viewport.offsetY})`);
    }
}

export function arrayHostSVGG(hostSVGG: SVGGElement[] | SVGGElement) {
    if (Array.isArray(hostSVGG)) {
        return hostSVGG;
    } else {
        return [hostSVGG];
    }
}
