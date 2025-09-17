import { PlaitBoard, getHitElementByPoint, getSelectedElements, toHostPoint, toViewBoxPoint } from '@plait/core';
import { isVirtualKey, isSpaceHotkey, isDelete } from '@plait/common';
import { GeometryCommonTextKeys, PlaitDrawElement } from '../interfaces';
import { editText } from '../utils/geometry';
import { getHitMultipleGeometryText, isDrawElementIncludeText, isMultipleTextGeometry } from '../utils';

export const withDrawHotkey = (board: PlaitBoard) => {
    const { keyDown, dblClick } = board;

    board.keyDown = (event: KeyboardEvent) => {
        const selectedElements = getSelectedElements(board);
        const isSingleSelection = selectedElements.length === 1;
        const targetElement = selectedElements[0];
        if (
            !PlaitBoard.isReadonly(board) &&
            !isVirtualKey(event) &&
            !isDelete(event) &&
            !isSpaceHotkey(event) &&
            isSingleSelection &&
            PlaitDrawElement.isGeometry(targetElement)
        ) {
            event.preventDefault();
            editText(board, targetElement);
            return;
        }

        keyDown(event);
    };

    board.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point, undefined, false);
            if (hitElement && PlaitDrawElement.isGeometry(hitElement) && isDrawElementIncludeText(hitElement)) {
                if (isMultipleTextGeometry(hitElement)) {
                    const hitText =
                        getHitMultipleGeometryText(board, hitElement, point) ||
                        hitElement.texts.find((item) => item.id.includes(GeometryCommonTextKeys.content)) ||
                        hitElement.texts[0];
                    editText(board, hitElement, hitText);
                } else {
                    editText(board, hitElement);
                }
            }
        }
        dblClick(event);
    };
    return board;
};
