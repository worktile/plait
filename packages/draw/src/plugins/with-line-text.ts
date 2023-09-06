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
import { Node, Text } from 'slate';
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
                editHandle(board, hitTarget, textIndex);
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
                    editHandle(board, hitTarget, hitComponent.textManages.length - 1, true);
                });
            }
        }

        dblclick(event);
    };

    return board;
};

function editHandle(board: PlaitBoard, element: PlaitLine, manageIndex: number, isFirstEdit: boolean = false) {
    const hitComponent = PlaitElement.getComponent(element) as LineComponent;
    const textManage = hitComponent.textManages[manageIndex];
    const originText = textManage.componentRef.instance.children;

    textManage.edit((origin, descendant) => {
        const text = Node.string(descendant[0]);
        const shouldRemove = (isFirstEdit && originText === descendant) || !text;
        if (shouldRemove) {
            DrawTransforms.removeLineText(board, element, manageIndex);
        }
    });
}
