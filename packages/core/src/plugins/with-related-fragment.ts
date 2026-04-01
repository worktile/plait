import { PlaitBoard, PlaitElement, RectangleClient } from '../interfaces';
import { WritableClipboardContext, WritableClipboardType, WritableClipboardOperationType, addOrCreateClipboardContext } from '../utils';

export function withRelatedFragment(board: PlaitBoard) {
    const { buildFragment } = board;

    board.buildFragment = (
        clipboardContext: WritableClipboardContext | null,
        rectangle: RectangleClient | null,
        operationType: WritableClipboardOperationType,
        originData?: PlaitElement[]
    ) => {
        let relatedFragment = board.getRelatedFragment(originData || []);
        if (relatedFragment) {
            if (originData?.length) {
                relatedFragment = relatedFragment.filter((item) => !originData.map((element) => element.id).includes(item.id));
            }
            if (relatedFragment.length) {
                const addition: WritableClipboardContext = {
                    text: '',
                    type: WritableClipboardType.elements,
                    elements: relatedFragment
                };
                clipboardContext = addOrCreateClipboardContext(clipboardContext, addition);
            }
        }
        return buildFragment(clipboardContext, rectangle, operationType, originData);
    };

    return board;
}
