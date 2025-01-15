import { PlaitBoard, PlaitPointerType } from '../interfaces';
import { isMobileDeviceEvent } from './pointer';

export const isSmartHand = (board: PlaitBoard, event: PointerEvent) => {
    return (
        PlaitBoard.isPointer(board, PlaitPointerType.hand) ||
        (PlaitBoard.isPointer(board, PlaitPointerType.selection) && isMobileDeviceEvent(event))
    );
};
