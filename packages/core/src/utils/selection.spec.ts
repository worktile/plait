import { fakeAsync, tick } from '@angular/core/testing';
import { PlaitBoard, PlaitElement } from '../interfaces';
import { clearNodeWeakMap, createKeyboardEvent, createTestingBoard, fakeNodeWeakMap } from '../testing';
import { Transforms } from '../transforms';
import { addSelectedElement, getSelectedElements, setSelectedElementsWithGroup } from '../utils';
import { withSelection } from '../plugins/with-selection';
import { withOptions } from '../plugins/with-options';
import { SHIFT } from '../constants';

const children: PlaitElement[] = [
    {
        id: 'mnwsQ',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-141.96484375, -125.28125],
            [-20.140625, -62.87109375]
        ],
        strokeWidth: 2,
        groupId: 'DQpaJ'
    },
    {
        id: 'DPMaD',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [103.947265625, -104.076171875],
            [225.771484375, -41.666015625]
        ],
        strokeWidth: 2,
        groupId: 'DQpaJ'
    },
    {
        id: 'DQpaJ',
        type: 'group',
        groupId: 'ztQrE'
    },
    {
        id: 'TdkZb',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-92.9169921875, 12.5224609375],
            [47.2666015625, 92.3779296875]
        ],
        strokeWidth: 2,
        groupId: 'ztQrE'
    },
    {
        id: 'ztQrE',
        type: 'group'
    },
    {
        id: 'JRnNj',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [166.896484375, 123.013671875],
            [273.189453125, 199.064453125]
        ],
        strokeWidth: 2
    }
];

describe('setSelectedElementsWithGroup', () => {
    let board: PlaitBoard;
    beforeEach(() => {
        board = createTestingBoard([withOptions, withSelection], children);
        fakeNodeWeakMap(board);
    });

    afterEach(() => {
        clearNodeWeakMap(board);
    });
    describe('when selection is collapsed', () => {
        describe('normal select', () => {
            it('should select all elements in group when hit group element', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);

                setSelectedElementsWithGroup(board, [children[0]], false);
                const selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(3);
                expect(selectedElements).toContain(children[0]);
                expect(selectedElements).toContain(children[1]);
                expect(selectedElements).toContain(children[3]);
            }));
            it('should select inner group when outer group has been selected', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);
                setSelectedElementsWithGroup(board, [children[0]], false);
                let selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(3);

                setSelectedElementsWithGroup(board, [children[0]], false);
                selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(2);
                expect(selectedElements).toContain(children[0]);
                expect(selectedElements).toContain(children[1]);
                expect(selectedElements).not.toContain(children[3]);
            }));
            it('should select inner element when outer group has been selected', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);
                setSelectedElementsWithGroup(board, [children[0]], false);
                setSelectedElementsWithGroup(board, [children[3]], false);
                const selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(1);
                expect(selectedElements).toContain(children[3]);
            }));
        });

        describe('shift select', () => {
            it('should select all elements in group when hit group element', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);
                addSelectedElement(board, children[children.length - 1]);
                const shiftEvent = createKeyboardEvent('keydown', SHIFT, 'SHIFT', {});
                board.keyDown(shiftEvent);

                setSelectedElementsWithGroup(board, [children[0]], true);
                const selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(4);
                expect(selectedElements).toContain(children[0]);
                expect(selectedElements).toContain(children[1]);
                expect(selectedElements).toContain(children[3]);
                expect(selectedElements).toContain(children[5]);
            }));
            it('should cancel select element in group when element has been selected', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);
                addSelectedElement(board, children[children.length - 1]);
                const shiftEvent = createKeyboardEvent('keydown', SHIFT, 'SHIFT', {});
                board.keyDown(shiftEvent);

                setSelectedElementsWithGroup(board, [children[0]], true);
                setSelectedElementsWithGroup(board, [children[0]], true);

                const selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(3);
                expect(selectedElements).not.toContain(children[0]);
                expect(selectedElements).toContain(children[1]);
                expect(selectedElements).toContain(children[3]);
                expect(selectedElements).toContain(children[5]);
            }));
            it('should only select hit element when another elements in group has been selected', fakeAsync(() => {
                Transforms.setSelection(board, {
                    anchor: [0, 0],
                    focus: [0, 0]
                });
                tick(200);
                addSelectedElement(board, children[children.length - 1]);
                const shiftEvent = createKeyboardEvent('keydown', SHIFT, 'SHIFT', {});
                board.keyDown(shiftEvent);

                setSelectedElementsWithGroup(board, [children[0]], true);
                setSelectedElementsWithGroup(board, [children[0]], true);
                setSelectedElementsWithGroup(board, [children[1]], true);
                let selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(2);

                setSelectedElementsWithGroup(board, [children[0]], true);

                selectedElements = getSelectedElements(board);
                expect(selectedElements.length).toBe(3);
                expect(selectedElements).toContain(children[0]);
                expect(selectedElements).not.toContain(children[1]);
                expect(selectedElements).toContain(children[3]);
                expect(selectedElements).toContain(children[5]);
            }));
        });
    });

    describe('when selection is range', () => {
        it('should select all elements in group when hit group element', fakeAsync(() => {
            Transforms.setSelection(board, {
                anchor: [0, 0],
                focus: [1, 1]
            });
            tick(200);

            setSelectedElementsWithGroup(board, [children[0]], false);
            const selectedElements = getSelectedElements(board);
            expect(selectedElements.length).toBe(3);
            expect(selectedElements).toContain(children[0]);
            expect(selectedElements).toContain(children[1]);
            expect(selectedElements).toContain(children[3]);
        }));
    });
});
