import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { WritableClipboardContext, createClipboardContext, WritableClipboardType, addClipboardContext } from '../utils';

export function withRelatedFragment(board: PlaitBoard) {
    const { buildFragment } = board;

    board.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut',
        elements?: PlaitElement[]
    ) => {
        let relatedFragment = board.getRelatedFragment(elements || []);
        if (relatedFragment) {
            if (elements?.length) {
                relatedFragment = relatedFragment.filter(item => !elements.map(element => element.id).includes(item.id));
            }
            if (relatedFragment.length) {
                if (!clipboardContext) {
                    clipboardContext = createClipboardContext(WritableClipboardType.elements, relatedFragment, '');
                } else {
                    clipboardContext = addClipboardContext(clipboardContext, {
                        text: '',
                        type: WritableClipboardType.elements,
                        elements: relatedFragment
                    });
                }
            }
        }
        return buildFragment(clipboardContext, rectangle, type, elements);
    };

    return board;
}
