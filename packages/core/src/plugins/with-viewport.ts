import { PlaitBoard } from '../interfaces/board';
import { debounce } from '../utils/common';
import { initializeViewBox, isFromScrolling, setIsFromScrolling, updateViewportOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    const throttleUpdate = debounce(
        () => {
            initializeViewBox(board);
            updateViewportOffset(board);
        },
        500,
        { leading: true }
    );

    board.onChange = () => {
        const isSetViewport = board.operations.some(op => op.type === 'set_viewport');
        const isOnlySetSelection = board.operations.every(op => op.type === 'set_selection');
        if (isOnlySetSelection) {
            return onChange();
        }
        if (isSetViewport && isFromScrolling(board)) {
            setIsFromScrolling(board, false);
            return onChange();
        }
        if (isSetViewport) {
            initializeViewBox(board);
            updateViewportOffset(board);
        } else {
            throttleUpdate();
        }
        onChange();
    };

    return board;
}
