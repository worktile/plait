import { PlaitBoard, RectangleClient, Transforms, getHitElementByPoint, toHostPoint, toViewBoxPoint } from '@plait/core';
import { getGroupByElement, getGroupRectangle, selectGroup } from '../utils/group';
import { PlaitGroup } from '../interfaces/group';

export function withGroup(board: PlaitBoard) {
    const { pointerDown, pointerUp, globalPointerUp } = board;
    let isShift = false;
    let isTextSelection = false;
    let group: PlaitGroup | null;

    board.pointerDown = (event: PointerEvent) => {
        if (!isShift && event.shiftKey) {
            isShift = true;
        }
        if (isShift && !event.shiftKey) {
            isShift = false;
        }
        const isHitText = !!(event.target instanceof Element && event.target.closest('.plait-richtext-container'));
        isTextSelection = isHitText && PlaitBoard.hasBeenTextEditing(board);

        // prevent text from being selected
        if (event.shiftKey && !isTextSelection) {
            event.preventDefault();
        }

        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const hitElement = getHitElementByPoint(board, point);
        if (hitElement) {
            group = getGroupByElement(board, hitElement);
            if (group) {
                selectGroup(board, group as PlaitGroup);
            }
        }
        pointerDown(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (group) {
            const rectangle = getGroupRectangle(board, group);
            const [start, end] = RectangleClient.getPoints(rectangle);
            Transforms.setSelection(board, { anchor: start, focus: end });
            return;
        }
        pointerUp(event);
    };


    board.globalPointerUp = (event: PointerEvent) => {
        group = null;
        globalPointerUp(event);
    }
    return board;
}
