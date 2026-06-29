import { buildPlaitHtml } from './common';
import { getClipboardData } from './clipboard';
import { WritableClipboardType } from './types';

const SVG_MIME_TYPE = 'image/svg+xml';

const readFileText = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => resolve(reader.result as string));
        reader.addEventListener('error', () => reject(reader.error));
        reader.readAsText(file);
    });
};

const createSvgDataTransferItem = (svg: string) => {
    return {
        kind: 'string',
        type: SVG_MIME_TYPE,
        getAsString: (callback: FunctionStringCallback | null) => callback?.(svg)
    } as DataTransferItem;
};

const createDataTransfer = ({
    html = '',
    text = '',
    svg = '',
    items = []
}: {
    html?: string;
    text?: string;
    svg?: string;
    items?: DataTransferItem[];
}) => {
    return {
        files: { length: 0 },
        items,
        getData: (type: string) => {
            if (type === 'text/html') {
                return html;
            }
            if (type === 'text/plain') {
                return text;
            }
            if (type === SVG_MIME_TYPE) {
                return svg;
            }
            return '';
        }
    } as unknown as DataTransfer;
};

describe('getClipboardData', () => {
    let originalClipboard: Clipboard | undefined;
    let originalClipboardItem: typeof ClipboardItem | undefined;

    beforeEach(() => {
        originalClipboard = navigator.clipboard;
        originalClipboardItem = window.ClipboardItem;
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: originalClipboard
        });
        (window as any).ClipboardItem = originalClipboardItem;
    });

    it('should read SVG clipboard content from string data transfer item as a file', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>';
        const dataTransfer = createDataTransfer({
            items: [createSvgDataTransferItem(svg)]
        });

        const clipboardData = await getClipboardData(dataTransfer);
        const file = clipboardData?.files?.[0];

        expect(file).toBeTruthy();
        expect(file?.name).toBe('plait-svg-image.svg');
        expect(file?.type).toBe(SVG_MIME_TYPE);
        expect(file && (await readFileText(file))).toBe(svg);
    });

    it('should keep Plait HTML clipboard data before SVG clipboard content', async () => {
        const element = { id: 'geometry', type: 'geometry', points: [] };
        const dataTransfer = createDataTransfer({
            html: buildPlaitHtml(WritableClipboardType.elements, [element]),
            items: [createSvgDataTransferItem('<svg xmlns="http://www.w3.org/2000/svg"></svg>')]
        });

        const clipboardData = await getClipboardData(dataTransfer);

        expect(clipboardData?.elements).toEqual([element]);
        expect(clipboardData?.files).toBeUndefined();
    });

    it('should read SVG clipboard content from data transfer MIME data', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>';
        const dataTransfer = createDataTransfer({ svg });

        const clipboardData = await getClipboardData(dataTransfer);
        const file = clipboardData?.files?.[0];

        expect(file).toBeTruthy();
        expect(file?.type).toBe(SVG_MIME_TYPE);
        expect(file && (await readFileText(file))).toBe(svg);
    });

    it('should fall back to navigator clipboard when SVG data transfer item has no string data', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10z"/></svg>';
        class MockClipboardItem {
            types = [SVG_MIME_TYPE];

            async getType(type: string) {
                return new Blob([svg], { type });
            }
        }
        (window as any).ClipboardItem = MockClipboardItem;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                read: () => Promise.resolve([new MockClipboardItem()])
            }
        });
        const dataTransfer = createDataTransfer({
            items: [createSvgDataTransferItem('')]
        });

        const clipboardData = await getClipboardData(dataTransfer);
        const file = clipboardData?.files?.[0];

        expect(file).toBeTruthy();
        expect(file?.type).toBe(SVG_MIME_TYPE);
        expect(file && (await readFileText(file))).toBe(svg);
    });

    it('should preserve SVG type before async string reading invalidates data transfer items', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h20v20z"/></svg>';
        class MockClipboardItem {
            types = [SVG_MIME_TYPE];

            async getType(type: string) {
                return new Blob([svg], { type });
            }
        }
        (window as any).ClipboardItem = MockClipboardItem;
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                read: () => Promise.resolve([new MockClipboardItem()])
            }
        });
        let itemsAccessCount = 0;
        const dataTransfer = {
            files: { length: 0 },
            get items() {
                itemsAccessCount++;
                return itemsAccessCount === 1 ? [createSvgDataTransferItem('')] : [];
            },
            getData: () => ''
        } as unknown as DataTransfer;

        const clipboardData = await getClipboardData(dataTransfer);
        const file = clipboardData?.files?.[0];

        expect(file).toBeTruthy();
        expect(file?.type).toBe(SVG_MIME_TYPE);
        expect(file && (await readFileText(file))).toBe(svg);
    });
});
