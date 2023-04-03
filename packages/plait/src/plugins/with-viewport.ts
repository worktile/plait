import { PlaitBoard } from '../interfaces/board';
import { initializeViewport, updateViewportScrolling, updateViewportContainerOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        if (board.operations.some(op => op.type !== 'set_selection')) {
            initializeViewport(board);
            updateViewportContainerOffset(board);
            updateViewportScrolling(board);
        }
        onChange();
    };

    return board;
}
