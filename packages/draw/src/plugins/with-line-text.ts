import {
    PlaitBoard,
    PlaitElement,
    getHitElementByPoint,
    getNearestPointBetweenPointAndSegments,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitDrawElement, PlaitLine } from '../interfaces';
import { Node } from 'slate';
import { getRatioByPoint, getTextManages } from '@plait/common';
import { buildText } from '@plait/text';
import { DrawTransforms } from '../transforms';
import { getLinePoints } from '../utils/line/line-basic';
import { getHitLineTextIndex } from '../utils/position/line';
import { isHitLineText } from '../utils/hit';

export const withLineText = (board: PlaitBoard) => {
    const { dblClick } = board;

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            const clickPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitTarget = getHitElementByPoint(board, clickPoint, (element: PlaitElement) => {
                return PlaitDrawElement.isLine(element);
            }) as undefined | PlaitLine;
            if (hitTarget) {
                const points = getLinePoints(board, hitTarget);
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
                        const textManages = getTextManages(hitTarget);
                        editHandle(board, hitTarget, textManages.length - 1, true);
                    });
                }
            }
        }
        dblClick(event);
    };

    return board;
};

function editHandle(board: PlaitBoard, element: PlaitLine, manageIndex: number, isFirstEdit: boolean = false) {
    const textManages = getTextManages(element);
    const textManage = textManages[manageIndex];
    const originText = textManage.componentRef.instance.children;

    textManage.edit((origin, descendant) => {
        const text = Node.string(descendant[0]);
        const shouldRemove = (isFirstEdit && originText === descendant) || !text;
        if (shouldRemove) {
            DrawTransforms.removeLineText(board, element, manageIndex);
        }
    });
}
