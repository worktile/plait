import {
    PlaitBoard,
    PlaitElement,
    Transforms,
    getHitElements,
    getNearestPointBetweenPointAndSegments,
    toPoint,
    transformPoint
} from '@plait/core';
import { PlaitDrawElement, PlaitLine } from '../interfaces';
import { getElbowPoints } from '../utils';
import { getRatioByPoint } from '@plait/common';
import { buildText } from '@plait/text';
import { LineComponent } from '../line.component';
import { DrawTransforms } from '../transforms';

export const withLineText = (board: PlaitBoard) => {
    const { dblclick } = board;

    board.dblclick = (event: MouseEvent) => {
        const clickPoint = transformPoint(board, toPoint(event.x, event.y, PlaitBoard.getHost(board)));
        const hitTarget = getHitElements(board, { ranges: [{ anchor: clickPoint, focus: clickPoint }] }, (element: PlaitElement) => {
            return PlaitDrawElement.isLine(element);
        })[0] as PlaitLine;
        if (hitTarget) {
            const points = getElbowPoints(board, hitTarget);
            const point = getNearestPointBetweenPointAndSegments(clickPoint, points);
            const texts = hitTarget.texts?.length ? [...hitTarget.texts] : [];
            const ratio = getRatioByPoint(points, point);
            texts.push({
                text: buildText(''),
                position: ratio,
                width: 10,
                height: 16
            });
            DrawTransforms.setLineTexts(board, hitTarget, texts);
            setTimeout(() => {
                const hitComponent = PlaitElement.getComponent(hitTarget) as LineComponent;
                hitComponent.textManages[hitComponent.textManages.length - 1].edit();
            });
        }

        dblclick(event);
    };

    return board;
};
