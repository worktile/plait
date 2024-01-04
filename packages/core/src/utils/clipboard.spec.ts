import { PlaitBoard, PlaitElement } from '../interfaces';
import { createTestingBoard, fakeNodeWeakMap } from '../testing';
import { insertFragmentSpy, withFakePlugin } from '../testing/core/with-fake-plugin';
import { blobAsString, copy, paste } from './clipboard';
import { addSelectedElement } from './selected-element';

describe('copying and pasting', () => {
    let board: PlaitBoard;
    const value: PlaitElement[] = [
        {
            id: 'EfMsT',
            type: 'geometry',
            shape: 'text',
            angle: 0,
            opacity: 1,
            textHeight: 20,
            text: {
                children: [
                    {
                        text: '文本'
                    }
                ]
            },
            points: [
                [660.15234375, 306.05859375],
                [696.15234375, 326.05859375]
            ],
            autoSize: true
        }
    ];

    beforeEach(() => {
        board = createTestingBoard([withFakePlugin], value);
        fakeNodeWeakMap(board);
    });
    describe('support navigator.clipboard', () => {
        const clipboardEvent = new ClipboardEvent('clipboard', {
            clipboardData: null
        });
        it('does nothing when copying with nothing is selected', async () => {
            const mockClipboard = doMockClipboard();
            await copy(board, clipboardEvent);

            expect(mockClipboard.current).toBeUndefined();
        });

        it('should copy selected element and paste correctly', async () => {
            addSelectedElement(board, board.children[0]);
            const mockClipboard = doMockClipboard();

            await copy(board, clipboardEvent);
            const clipboardItem = mockClipboard.current[0] as ClipboardItem;
            expect(clipboardItem.types).toEqual(['text/html', 'text/plain']);

            const htmlBlob = await clipboardItem.getType('text/html');
            const htmlString = await blobAsString(htmlBlob);
            expect(htmlString).toContain('<plait>');
            expect(htmlString).toContain(JSON.stringify(board.children[0]));

            await paste(board, clipboardEvent, [0, 0]);
            expect(insertFragmentSpy).toHaveBeenCalled();
            expect(insertFragmentSpy).toHaveBeenCalledWith({
                type: 'plait',
                value
            });
        });
    });
    describe('not support navigator.clipboard but clipboardData is exit', () => {
        it('does nothing when copying with nothing is selected', async () => {
            const mockClipboard = doMockClipboard();

            const clipboardCopyEvent = new ClipboardEvent('copy');
            document.dispatchEvent(clipboardCopyEvent);

            expect(mockClipboard.current).toBeUndefined();
        });

        it('should copy selected element and paste correctly', async () => {
            addSelectedElement(board, board.children[0]);
            removeWriteFromClipboard();
            const clipboardCopyEvent = new ClipboardEvent('clipboard', {
                clipboardData: new DataTransfer()
            });

            await copy(board, clipboardCopyEvent);
            expect(clipboardCopyEvent?.clipboardData?.types).toEqual(['application/x-plait-fragment', 'text/plain']);

            await paste(board, clipboardCopyEvent, [0, 0]);
            expect(insertFragmentSpy).toHaveBeenCalled();
            expect(insertFragmentSpy).toHaveBeenCalledWith({
                type: 'plait',
                value
            });
        });
    });
});

const doMockClipboard = () => {
    const context: { current: any } = { current: undefined };
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({
        write: (content: any) => {
            context.current = content;
            return Promise.resolve();
        },
        read: () => {
            return Promise.resolve(context.current);
        }
    });
    return context;
};

const removeWriteFromClipboard = () => {
    const clipboardSpy = jasmine.createSpyObj('Clipboard', ['writeText']);
    spyOnProperty(navigator, 'clipboard').and.returnValue(clipboardSpy);
};
