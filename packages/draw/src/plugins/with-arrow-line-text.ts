import {
    PlaitBoard,
    PlaitNode,
    getHitElementByPoint,
    getI18nValue,
    getNearestPointBetweenPointAndSegments,
    toHostPoint,
    toViewBoxPoint
} from '@plait/core';
import { PlaitArrowLine, PlaitDrawElement } from '../interfaces';
import { Node } from 'slate';
import { buildText, DEFAULT_FONT_FAMILY, getMemorizedLatest, getRatioByPoint, getTextManages, measureElement } from '@plait/common';
import { DrawTransforms } from '../transforms';
import { getArrowLinePoints } from '../utils/arrow-line/arrow-line-basic';
import { getHitArrowLineTextIndex } from '../utils/position/arrow-line';
import { isHitArrowLineText } from '../utils/hit';
import { LINE_TEXT } from '../constants/line';
import { DEFAULT_FONT_SIZE } from '@plait/text-plugins';
import { DrawI18nKey } from '../constants/default';

export const getDefaultLineText = (board: PlaitBoard) => {
    return getI18nValue(board, DrawI18nKey.lineText, LINE_TEXT);
};

export const withArrowLineText = (board: PlaitBoard) => {
    const { dblClick } = board;

    board.dblClick = (event: MouseEvent) => {
        if (!PlaitBoard.isReadonly(board)) {
            const clickPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitTarget = getHitElementByPoint(board, clickPoint) as undefined | PlaitArrowLine;
            if (hitTarget && PlaitDrawElement.isArrowLine(hitTarget)) {
                const hitTargetPath = hitTarget && PlaitBoard.findPath(board, hitTarget);
                const points = getArrowLinePoints(board, hitTarget);
                const point = getNearestPointBetweenPointAndSegments(clickPoint, points);
                const texts = hitTarget.texts?.length ? [...hitTarget.texts] : [];
                const textIndex = getHitArrowLineTextIndex(board, hitTarget, clickPoint);
                const isHitText = isHitArrowLineText(board, hitTarget, clickPoint);
                if (isHitText) {
                    editHandle(board, hitTarget, textIndex);
                } else {
                    const defaultLineText = getDefaultLineText(board);
                    const textMemory = getMemorizedLatest('arrow-line')?.text || {};
                    const textElement = buildText(defaultLineText, undefined, textMemory);
                    const { width, height } = measureElement(textElement, {
                        fontSize: DEFAULT_FONT_SIZE,
                        fontFamily: DEFAULT_FONT_FAMILY
                    });
                    const ratio = getRatioByPoint(points, point);
                    texts.push({
                        text: textElement,
                        position: ratio,
                        width,
                        height
                    });
                    DrawTransforms.setArrowLineTexts(board, hitTarget, texts);
                    setTimeout(() => {
                        if (hitTargetPath) {
                            const newHitTarget = PlaitNode.get(board, hitTargetPath) as PlaitArrowLine;
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

function editHandle(board: PlaitBoard, element: PlaitArrowLine, manageIndex: number, isFirstEdit: boolean = false) {
    const textManages = getTextManages(element);
    const textManage = textManages[manageIndex];
    textManage.edit(() => {
        const text = Node.string(textManage.getText());
        const defaultLineText = getDefaultLineText(board);
        const shouldRemove = !text || (isFirstEdit && text === defaultLineText);
        if (shouldRemove) {
            DrawTransforms.removeArrowLineText(board, element, manageIndex);
        }
    });
}
