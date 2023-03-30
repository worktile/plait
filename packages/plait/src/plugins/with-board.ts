import { BOARD_TO_ON_CHANGE } from '../utils/weak-maps';
import { PlaitBoard } from '../interfaces/board';
import { setViewport } from '../utils/viewport';

export function withBoard(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        const onContextChange = BOARD_TO_ON_CHANGE.get(board);

        const operations = board.operations;
        if (operations.length > 0 && ['remove_node', 'insert_node', 'set_node'].includes(operations[0].type)) {
            // setViewport(board);

        }

        const setViewportOp = operations.find(op => op.type === 'set_viewport');
        if (setViewportOp) {
            // const boardComponent = PlaitBoard.getComponent(board);
            // boardComponent.applyViewport();
        }

        if (onContextChange) {
            onContextChange();
        }

        onChange();
    };

    return board;
}
