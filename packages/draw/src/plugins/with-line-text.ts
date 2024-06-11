import {
    PlaitBoard,
    PlaitElement,
    PlaitNode,
    getHitElementByPoint,
    getNearestPointBetweenPointAndSegments,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitDrawElement, PlaitLine } from '../interfaces';
import { Node } from 'slate';
import { buildText, getRatioByPoint, getTextManages } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { getLinePoints } from '../utils/line/line-basic';
import { getHitLineTextIndex } from '../utils/position/line';
import { isHitLineText } from '../utils/hit';
import { LINE_TEXT } from '../constants/line';

export const withLineText = (board: PlaitBoard) => {
    const { dblClick } = board;

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            const clickPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitTarget = getHitElementByPoint(board, clickPoint, (element: PlaitElement) => {
                return PlaitDrawElement.isLine(element);
            }) as undefined | PlaitLine;
            const hitTargetPath = hitTarget && PlaitBoard.findPath(board, hitTarget);
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
                        text: buildText(LINE_TEXT),
                        position: ratio,
                        width: 28,
                        height: 20
                    });
                    DrawTransforms.setLineTexts(board, hitTarget, texts);
                    setTimeout(() => {
                        if (hitTargetPath) {
                            const newHitTarget = PlaitNode.get(board, hitTargetPath) as PlaitLine;
                            const textManages = getTextManages(newHitTarget);
                            editHandle(board, newHitTarget, textManages.length - 1, true);
                        }
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
    textManage.edit(() => {
        const text = Node.string(textManage.getText());
        const shouldRemove = !text || (isFirstEdit && text === LINE_TEXT);
        if (shouldRemove) {
            DrawTransforms.removeLineText(board, element, manageIndex);
        }
    });
}
