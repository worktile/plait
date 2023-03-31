import { PlaitBoard } from '../interfaces/board';
import { initializeViewport, updateScrollOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        initializeViewport(board);
        updateScrollOffset(board);

        onChange();
    };

    return board;
}
