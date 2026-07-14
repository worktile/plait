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

const createSvgDataTransferItem = (svg: string, onRead?: () => void) => {
    return {
        kind: 'string',
        type: SVG_MIME_TYPE,
        getAsString: (callback: FunctionStringCallback | null) => {
            queueMicrotask(() => {
                onRead?.();
                callback?.(svg);
            });
        }
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
    let originalClipboardDescriptor: PropertyDescriptor | undefined;

    beforeEach(() => {
        originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });

    afterEach(() => {
        if (originalClipboardDescriptor) {
            Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
        } else {
            Reflect.deleteProperty(navigator, 'clipboard');
        }
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

    it('should use synchronous SVG MIME data when the SVG item string is empty', async () => {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10z"/></svg>';
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {}
        });
        const dataTransfer = createDataTransfer({
            svg,
            items: [createSvgDataTransferItem('')]
        });

        const clipboardData = await getClipboardData(dataTransfer);
        const file = clipboardData?.files?.[0];

        expect(file).toBeTruthy();
        expect(file?.type).toBe(SVG_MIME_TYPE);
        expect(file && (await readFileText(file))).toBe(svg);
    });

    it('should preserve plain text before async SVG reading without using navigator clipboard', async () => {
        const text = 'plain text clipboard data';
        let dataTransferReadable = true;
        const read = jasmine.createSpy('read').and.callFake(() => Promise.reject(new Error('unexpected navigator clipboard read')));
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                read
            }
        });
        const dataTransfer = {
            files: { length: 0 },
            items: [
                createSvgDataTransferItem('', () => {
                    dataTransferReadable = false;
                })
            ],
            getData: (type: string) => {
                if (!dataTransferReadable) {
                    return '';
                }
                return type === 'text/plain' ? text : '';
            }
        } as unknown as DataTransfer;

        const clipboardData = await getClipboardData(dataTransfer);

        expect(clipboardData?.text).toBe(text);
        expect(read).not.toHaveBeenCalled();
    });
});
