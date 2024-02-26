import { PlaitBoard, getHitElementByPoint, toHostPoint, toViewBoxPoint } from '@plait/core';
import { getGroupByElement, selectGroup } from '../utils/group';
import { PlaitGroup } from '../interfaces/group';

export function withGroup(board: PlaitBoard) {
    const { pointerDown } = board;
    board.pointerDown = (event: PointerEvent) => {
        const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        const hitElement = getHitElementByPoint(board, point);
        if (hitElement) {
            const group = getGroupByElement(board, hitElement);
            if (group) {
                selectGroup(board, group as PlaitGroup);
            }
        }
        pointerDown(event);
    };
    return board;
}
