import { PlaitBoard, RectangleClient } from '../interfaces';
import {
    WritableClipboardContext,
    createClipboardContext,
    WritableClipboardType,
    addClipboardContext
} from '../utils';

export function withRelatedFragment(board: PlaitBoard) {
    const { setFragment } = board;

    board.setFragment = (
        data: DataTransfer | null,
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut'
    ) => {
        const relatedFragment = board.getRelatedFragment([]);
        if (!clipboardContext) {
            clipboardContext = createClipboardContext(WritableClipboardType.elements, relatedFragment, '');
        } else {
            clipboardContext = addClipboardContext(clipboardContext, {
                text: '',
                type: WritableClipboardType.elements,
                data: relatedFragment
            });
        }
        setFragment(data, clipboardContext, rectangle, type);
    };

    return board;
}
