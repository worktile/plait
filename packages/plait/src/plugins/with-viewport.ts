import { PlaitBoard } from '../interfaces/board';
import { initializeViewport, updateViewportContainerOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        initializeViewport(board);
        updateViewportContainerOffset(board);

        onChange();
    };

    return board;
}
