import { PlaitBoard } from '../interfaces/board';
import { initializeViewport, updateViewportOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        initializeViewport(board);
        updateViewportOffset(board);

        onChange();
    };

    return board;
}
