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
import { Text } from 'slate';
import { getElbowPoints, getHitLineTextIndex, isHitLineText } from '../utils';
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
            const textIndex = getHitLineTextIndex(board, hitTarget, clickPoint);
            const isHitText = isHitLineText(board, hitTarget, clickPoint);
            if (isHitText) {
                const hitComponent = PlaitElement.getComponent(hitTarget) as LineComponent;
                hitComponent.textManages[textIndex].edit((origin, descendant) => {
                    const text = (descendant[0].children[0] as Text).text;
                    if (!text) {
                        DrawTransforms.removeLineText(board, hitTarget, textIndex);
                    }
                });
            } else {
                const ratio = getRatioByPoint(points, point);
                texts.push({
                    text: buildText('文本'),
                    position: ratio,
                    width: 28,
                    height: 20
                });
                DrawTransforms.setLineTexts(board, hitTarget, texts);
                setTimeout(() => {
                    const hitComponent = PlaitElement.getComponent(hitTarget) as LineComponent;
                    const textManage = hitComponent.textManages[hitComponent.textManages.length - 1];
                    const originText = textManage.componentRef.instance.children;
                    textManage.edit((origin, text) => {
                        if (originText === text) {
                            DrawTransforms.removeLineText(board, hitTarget, texts.length - 1);
                        }
                    });
                });
            }
        }

        dblclick(event);
    };

    return board;
};
