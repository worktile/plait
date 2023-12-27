import { isHotkey } from 'is-hotkey';
import { Ancestor, MERGING, PlaitBoard, PlaitElement, PlaitPluginKey, Point } from '../interfaces';
import { BoardTransforms, Transforms } from '../transforms';
import { depthFirstRecursion, getSelectedElements, hotkeys, throttleRAF } from '../utils';
import { PlaitOptionsBoard } from './with-options';
import { WithPluginOptions } from './with-selection';

export const withHotkey = (board: PlaitBoard) => {
    const { keydown, keyup, globalKeydown } = board;

    let isShift = false;

    board.keydown = (event: KeyboardEvent) => {
        const options = (board as PlaitOptionsBoard).getPluginOptions<WithPluginOptions>(PlaitPluginKey.withSelection);

        if (hotkeys.isShift(event)) {
            isShift = true;
        }

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

        if (!PlaitBoard.isReadonly(board) && selectedElements.length > 0 && (hotkeys.isArrow(event) || hotkeys.isExtendArrow(event))) {
            event.preventDefault();
            const offset = [0, 0];
            const buffer = isShift ? 10 : 1;
            switch (true) {
                case hotkeys.isMoveUp(event) || hotkeys.isExtendUp(event): {
                    offset[1] = -buffer;
                    break;
                }
                case hotkeys.isMoveDown(event) || hotkeys.isExtendDown(event): {
                    offset[1] = buffer;
                    break;
                }
                case hotkeys.isMoveBackward(event) || hotkeys.isExtendBackward(event): {
                    offset[0] = -buffer;
                    break;
                }
                case hotkeys.isMoveForward(event) || hotkeys.isExtendForward(event): {
                    offset[0] = buffer;
                    break;
                }
            }
            const selectedElements = getSelectedElements(board);
            const relatedElements = board.getRelatedFragment([]);
            const movableElements = board.children.filter(item => board.isMovable(item));

            throttleRAF(() => {
                [...selectedElements, ...relatedElements]
                    .filter(element => movableElements.includes(element))
                    .forEach(element => {
                        const points = element.points || [];
                        const newPoints = points.map(p => [p[0] + offset[0], p[1] + offset[1]]) as Point[];
                        Transforms.setNode(
                            board,
                            {
                                points: newPoints
                            },
                            PlaitBoard.findPath(board, element)
                        );
                        MERGING.set(board, true);
                    });
            });
        }

        keydown(event);
    };

    board.keyup = (event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            isShift = false;
        }
        MERGING.set(board, false);
        keyup(event);
    };

    board.globalKeydown = (event: KeyboardEvent) => {
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
        globalKeydown(event);
    };

    return board;
};
