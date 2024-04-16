import { PlaitBoard, RectangleClient } from '../interfaces';
import {
    WritableClipboardContext,
    createClipboardContext,
    WritableClipboardType,
    addClipboardContext
} from '../utils';

export function withRelatedFragment(board: PlaitBoard) {
    const { buildFragment } = board;

    board.buildFragment = (
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
                elements: relatedFragment
            });
        }
        return buildFragment(clipboardContext, rectangle, type);
    };

    return board;
}
