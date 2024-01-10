import { isHotkey } from 'is-hotkey';
import { Ancestor, PlaitBoard, PlaitElement, PlaitPluginKey } from '../interfaces';
import { BoardTransforms, Transforms } from '../transforms';
import { depthFirstRecursion, getSelectedElements, hotkeys } from '../utils';
import { PlaitOptionsBoard } from './with-options';
import { WithPluginOptions } from './with-selection';

export const withHotkey = (board: PlaitBoard) => {
    const { keyDown, keyUp, globalKeyDown } = board;

    board.keyDown = (event: KeyboardEvent) => {
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);
        if (!PlaitBoard.isReadonly(board) && options.isMultiple && isHotkey('mod+a', event)) {
            event.preventDefault();
            let elements: PlaitElement[] = [];
            depthFirstRecursion<Ancestor>(
                board,
                node => {
                    if (PlaitBoard.isBoard(node)) {
                        return;
                    }
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
            Transforms.addSelectionWithTemporaryElements(board, elements);
            return;
        }

        const selectedElements = getSelectedElements(board);
        if (
            !PlaitBoard.isReadonly(board) &&
            selectedElements.length > 0 &&
            (hotkeys.isDeleteBackward(event) || hotkeys.isDeleteForward(event))
        ) {
            event.preventDefault();
            board.deleteFragment(null);
        }

        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        keyUp(event);
    };

    board.globalKeyDown = (event: KeyboardEvent) => {
        if (PlaitBoard.getMovingPointInBoard(board) || PlaitBoard.isMovingPointInBoard(board)) {
            if (isHotkey(['mod+=', 'mod++'], { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, board.viewport.zoom + 0.1, false);
                return;
            }
            if (isHotkey(['mod+shift+=', 'mod+shift++'], { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.fitViewport(board);
                return;
            }
            if (isHotkey(['mod+-', 'mod+shift+-'])(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, board.viewport.zoom - 0.1);
                return;
            }
            if (isHotkey(['mod+0', 'mod+shift+0'], { byKey: true })(event)) {
                event.preventDefault();
                BoardTransforms.updateZoom(board, 1);
                return;
            }
        }
        globalKeyDown(event);
    };

    return board;
};
