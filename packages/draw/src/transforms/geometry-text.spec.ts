import { createTestingBoard, PlaitBoard } from '@plait/core';
import { Alignment } from '@plait/common';
import { DrawTransforms } from '.';
import { BasicShapes, PlaitText } from '../interfaces';
import { ShapeDefaultSpace } from '../constants';
import { getTextRectangle } from '../utils';

describe('geometry text transforms', () => {
    let board: PlaitBoard;

    const createTextElement = (align: Alignment, points: PlaitText['points'] = [
        [100, 50],
        [160, 70]
    ]): PlaitText => ({
        id: align,
        type: 'geometry',
        shape: BasicShapes.text,
        angle: 0,
        opacity: 1,
        autoSize: true,
        text: {
            children: [{ text: 'text' }],
            align
        },
        points
    });

    beforeEach(() => {
        board = createTestingBoard([], []);
    });

    it('should keep the first point fixed when resizing right aligned auto-size text', () => {
        const element = createTextElement(Alignment.right);
        board.children = [element];

        DrawTransforms.setTextSize(board, element, 80, 24);

        expect((board.children[0] as PlaitText).points).toEqual([
            [100, 50],
            [100 + 80 + ShapeDefaultSpace.rectangleAndText * 2, 50 + 24]
        ]);
    });

    it('should keep the first point fixed when resizing center aligned auto-size text', () => {
        const element = createTextElement(Alignment.center);
        board.children = [element];

        DrawTransforms.setTextSize(board, element, 80, 24);

        expect((board.children[0] as PlaitText).points).toEqual([
            [100, 50],
            [100 + 80 + ShapeDefaultSpace.rectangleAndText * 2, 50 + 24]
        ]);
    });

    it('should render auto-size text rectangle by the first point only', () => {
        const element = createTextElement(Alignment.left);
        const elementWithDifferentEndPoint = createTextElement(Alignment.left, [
            [100, 50],
            [20, 120]
        ]);

        expect(getTextRectangle(board, elementWithDifferentEndPoint)).toEqual(getTextRectangle(board, element));
    });
});
