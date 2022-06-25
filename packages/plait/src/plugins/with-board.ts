import { BOARD_TO_ON_CHANGE } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';

export function withBoard(board: PlaitBoard) {
    const { onChange, mouseup } = board;

    board.onChange = () => {
        const onContextChange = BOARD_TO_ON_CHANGE.get(board);

        if (onContextChange) {
            onContextChange();
        }

        onChange();
    };

    return board;
}
