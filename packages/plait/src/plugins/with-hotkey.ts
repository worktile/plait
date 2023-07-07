import isHotkey from 'is-hotkey';
import { Ancestor, PlaitBoard, PlaitElement } from '../interfaces';
import { BoardTransforms, Transforms } from '../transforms';
import { depthFirstRecursion } from '../utils';

export const withHotkey = (board: PlaitBoard) => {
    const { keydown } = board;

    board.keydown = (event: KeyboardEvent) => {
        if (!PlaitBoard.isReadonly(board) && isHotkey('mod+a', event)) {
            event.preventDefault();
            let elements: PlaitElement[] = [];
            depthFirstRecursion<Ancestor>(
                board,
                node => {
                    elements.push(node as PlaitElement);
                },
                node => {
                    if (PlaitBoard.isBoard(node) || board.isRecursion(node)) {
                        return true;
                    } else {
                        return false;
                    }
                },
                true
            );

            Transforms.setSelectionWithTemporaryElements(board, elements);
        }

        if (PlaitBoard.getMovingPoint(board)) {
            if (isHotkey(['mod+=', 'mod++'], { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, board.viewport.zoom + 0.1, false);
            }
            if (isHotkey('mod+-', { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, board.viewport.zoom - 0.1);
            }
            if (isHotkey('mod+0', { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, 1);
                return;
            }
            if (isHotkey('mod+shift+=', { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.fitViewport(board);
                return;
            }
        }

        keydown(event);
    };

    return board;
};
