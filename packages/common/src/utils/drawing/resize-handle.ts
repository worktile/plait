import { PlaitBoard, Point, drawCircle } from '@plait/core';
import { Options } from 'roughjs/bin/core';
import { PRIMARY_COLOR, RESIZE_HANDLE_DIAMETER } from '../../constants/default';

export const drawHandle = (board: PlaitBoard, centerPoint: Point) => {
    const options: Options = { stroke: '#99999995', strokeWidth: 2, fill: '#FFF', fillStyle: 'solid' };
    return drawCircle(PlaitBoard.getRoughSVG(board), centerPoint, RESIZE_HANDLE_DIAMETER, options);
};

export function drawFillPrimaryHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: '#FFFFFF',
        strokeWidth: 1,
        fill: `${PRIMARY_COLOR}`,
        fillStyle: 'solid'
    });
}

export function drawPrimaryHandle(board: PlaitBoard, point: Point) {
    return drawCircle(PlaitBoard.getRoughSVG(board), point, RESIZE_HANDLE_DIAMETER, {
        stroke: `${PRIMARY_COLOR}`,
        strokeWidth: 2,
        fill: `#FFFFFF`,
        fillStyle: 'solid'
    });
}