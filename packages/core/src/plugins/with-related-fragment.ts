import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { WritableClipboardContext, createClipboardContext, WritableClipboardType, addClipboardContext } from '../utils';

export function withRelatedFragment(board: PlaitBoard) {
    const { buildFragment } = board;

    board.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        type: 'copy' | 'cut',
        originData?: PlaitElement[]
    ) => {
        let relatedFragment = board.getRelatedFragment(originData || []);
        if (relatedFragment) {
            if (originData?.length) {
                relatedFragment = relatedFragment.filter(item => !originData.map(element => element.id).includes(item.id));
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
        return buildFragment(clipboardContext, rectangle, type, originData);
    };

    return board;
}
