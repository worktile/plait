import { Subscription, timer } from 'rxjs';
import { PlaitBoard } from '../interfaces/board';
import { initializeViewBox, updateViewportOffset } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;
    let timerSubscription: Subscription;

    board.onChange = () => {
        const isSetViewport = board.operations.some(op => op.type === 'set_viewport');
        const isOnlySetSelection = board.operations.some(op => op.type === 'set_selection');
        if (isOnlySetSelection) {
            return onChange();
        }
        if (isSetViewport) {
            initializeViewBox(board);
            updateViewportOffset(board);
        } else {
            if (timerSubscription) {
                timerSubscription.unsubscribe();
            }
            timerSubscription = timer(500).subscribe(() => {
                initializeViewBox(board);
                updateViewportOffset(board);
            });
        }
        onChange();
    };

    return board;
}
