import { BOARD_TO_ON_CHANGE, BOARD_TO_AFTER_CHANGE } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';

export function withBoard(board: PlaitBoard) {
    const { onChange, afterChange } = board;

    board.onChange = () => {
        const onContextChange = BOARD_TO_ON_CHANGE.get(board);
        if (onContextChange) {
            onContextChange();
        }
        onChange();
    };

    board.afterChange = () => {
        const afterContextChange = BOARD_TO_AFTER_CHANGE.get(board);
        if (afterContextChange) {
            afterContextChange();
        }
        afterChange();
    }

    return board;
}
