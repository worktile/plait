import { PlaitBoard, PlaitElement, getHitElementByPoint, getSelectedElements, toHostPoint, toViewBoxPoint } from '@plait/core';
import { isVirtualKey, isSpaceHotkey, isDelete } from '@plait/common';
import { GeometryComponent } from '../geometry.component';
import { PlaitDrawElement } from '../interfaces';

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
            (PlaitElement.getComponent(targetElement) as GeometryComponent).editText();
            return;
        }

        keyDown(event);
    };

    board.dblClick = (event: MouseEvent) => {
        event.preventDefault();
        if (!PlaitBoard.isReadonly(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const hitElement = getHitElementByPoint(board, point);
            if (hitElement && PlaitDrawElement.isGeometry(hitElement)) {
                const component = PlaitElement.getComponent(hitElement) as GeometryComponent;
                component.editText();
            }
        }
        dblClick(event);
    };
    return board;
};
