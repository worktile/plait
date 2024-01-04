import { getPlaitClipboardData, getSelectedElements, setPlaitClipboardData } from '../../utils';
import { PlaitBoard, PlaitElement, Point, RectangleClient } from '../../interfaces';
import { getRectangleByPoints } from '@plait/common';

export const insertFragmentSpy = jasmine.createSpy('insertFragment spy', pasteData => pasteData);

export const withFakePlugin = (board: PlaitBoard) => {
    const { setFragment, insertFragment } = board;

    board.setFragment = async (data: DataTransfer | null, rectangle: RectangleClient | null, type: 'copy' | 'cut') => {
        const selectedElements = getSelectedElements(board);
        if (selectedElements.length) {
            const texts = selectedElements.map(item => item.text?.children?.length && item.text.children[0].text);
            await setPlaitClipboardData(data, selectedElements, texts.join(' '));
        }
        setFragment(data, rectangle, type);
    };

    board.insertFragment = async (clipboardData: DataTransfer | null, targetPoint: Point) => {
        const pasteData = await getPlaitClipboardData(clipboardData);
        if (!pasteData || !pasteData?.value.length) {
            return;
        }
        insertFragmentSpy(pasteData);
        insertFragment(clipboardData, targetPoint);
    };

    board.getRectangle = (element: PlaitElement) => {
        return getRectangleByPoints(element.points!);
    };

    return board;
};
