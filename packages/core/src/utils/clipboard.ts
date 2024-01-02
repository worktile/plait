import { CLIP_BOARD_FORMAT_KEY } from '../constants';
import { PlaitBoard, PlaitElement, Point } from '../interfaces';
import { getRectangleByElements } from './element';
import { getSelectedElements } from './selected-element';

export type PlaitExternalContentSource =
    | {
          type: 'plait';
          data: PlaitElement[];
      }
    | {
          type: 'text';
          data: string;
          subtype: 'json' | 'html' | 'text';
      }
    | {
          type: 'error';
          data: string | null;
          reason: string;
      };

type ClipboardThing =
    | {
          type: 'file';
          source: Promise<File | null>;
      }
    | {
          type: 'blob';
          source: Promise<Blob | null>;
      }
    | {
          type: 'html';
          source: Promise<string>;
      }
    | {
          type: 'text';
          source: Promise<string>;
      }
    | {
          type: string;
          source: Promise<string>;
      };

export interface PlaitPasteDataType<T = any> {
    type: 'plait' | 'file' | 'text';
    value: T;
}

export const copy = async (board: PlaitBoard, event: MouseEvent | ClipboardEvent) => {
    event.preventDefault();
    const selectedElements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    await clearPlaitClipboardData();
    const clipboardData = event instanceof ClipboardEvent ? event.clipboardData : null;
    await board.setFragment(clipboardData, rectangle, 'copy');
};

export const cut = async (board: PlaitBoard, event: MouseEvent | ClipboardEvent) => {
    event.preventDefault();
    const selectedElements = getSelectedElements(board);
    const rectangle = getRectangleByElements(board, selectedElements, false);
    await clearPlaitClipboardData();
    const clipboardData = event instanceof ClipboardEvent ? event.clipboardData : null;
    await board.setFragment(clipboardData, rectangle, 'cut');
    board.deleteFragment(clipboardData);
};

export const paste = async (board: PlaitBoard, event: MouseEvent | ClipboardEvent, targetPoint: Point) => {
    await board.insertFragment(event instanceof ClipboardEvent ? event.clipboardData : null, targetPoint);
};

export const getTextFromClipboard = (data: DataTransfer | null) => {
    return (data ? data.getData(`text/plain`) : '') as string;
};

export const clearPlaitClipboardData = async () => {
    if (!('clipboard' in navigator && 'write' in navigator.clipboard)) {
        return;
    }
    const clipboardData = await geClipboardDataByClipboardApi();
    if (clipboardData && clipboardData.type === 'plait' && (clipboardData.value as PlaitElement[]).length) {
        await navigator.clipboard.writeText('');
    }
};

export const setPlaitClipboardData = async (elements: PlaitElement[]) => {
    if (!('clipboard' in navigator && 'write' in navigator.clipboard)) {
        return;
    }
    let result = [...elements];
    const clipboardData = await geClipboardDataByClipboardApi();
    if (clipboardData && clipboardData.type === 'plait' && (clipboardData.value as PlaitElement[]).length) {
        result.push(...(clipboardData.value as PlaitElement[]));
    }
    const stringifiedClipboard = JSON.stringify({
        type: `application/${CLIP_BOARD_FORMAT_KEY}`,
        value: result
    });

    if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
        await navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([`<plait>${stringifiedClipboard}</plait>`], {
                    type: 'text/html'
                }),
                'text/plain': new Blob([JSON.stringify(elements)], { type: 'text/plain' })
            })
        ]);
    } else if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(`<plait>${stringifiedClipboard}</plait>`);
    }
};

export const getClipboardDataByNative = async (clipboardData: DataTransfer) => {
    const things = createClipboardThingByNative(clipboardData);
    return await parseClipboardThings(things);
};

export const geClipboardDataByClipboardApi = async () => {
    if (!('clipboard' in navigator && 'write' in navigator.clipboard)) {
        return;
    }
    try {
        const clipboardItems = await navigator.clipboard?.read();
        const things = createClipboardThingByClipboardApi(clipboardItems);
        return await parseClipboardThings(things);
    } catch (error) {
        return null;
    }
};

export const createClipboardThingByNative = (clipboardData: DataTransfer) => {
    const things: ClipboardThing[] = [];
    for (const item of Object.values(clipboardData.items)) {
        switch (item.kind) {
            case 'file': {
                // files are always blobs
                things.push({
                    type: 'file',
                    source: new Promise(r => r(item.getAsFile())) as Promise<File | null>
                });
                break;
            }
            case 'string': {
                // strings can be text or html
                if (item.type === 'text/html') {
                    things.push({
                        type: 'html',
                        source: new Promise(r => {
                            r(clipboardData.getData('text/html'));
                        }) as Promise<string>
                    });
                } else if (item.type === 'text/plain') {
                    things.push({
                        type: 'text',
                        source: new Promise(r => {
                            r(clipboardData.getData('text/plain'));
                        }) as Promise<string>
                    });
                } else {
                    things.push({
                        type: item.type,
                        source: new Promise(r => {
                            r(clipboardData.getData('item.type'));
                        }) as Promise<string>
                    });
                }
                break;
            }
        }
    }
    return things;
};

export const createClipboardThingByClipboardApi = (clipboardItems: ClipboardItem[]) => {
    // We need to populate the array of clipboard things
    // based on the ClipboardItems from the Clipboard API.
    // This is done in a different way than when using
    // the clipboard data from the paste event.

    const things: ClipboardThing[] = [];
    if (Array.isArray(clipboardItems) && clipboardItems[0] instanceof ClipboardItem) {
        for (const item of clipboardItems) {
            if (isFile(item)) {
                for (const type of item.types) {
                    if (type.match(/^image\//)) {
                        things.push({ type: 'blob', source: item.getType(type) });
                    }
                }
            }

            if (item.types.includes('text/html')) {
                things.push({
                    type: 'html',
                    source: new Promise<string>(r => item.getType('text/html').then(blob => blobAsString(blob).then(r)))
                });
            }

            if (item.types.includes('text/uri-list')) {
                things.push({
                    type: 'url',
                    source: new Promise<string>(r => item.getType('text/uri-list').then(blob => blobAsString(blob).then(r)))
                });
            }

            if (item.types.includes('text/plain')) {
                things.push({
                    type: 'text',
                    source: new Promise<string>(r => item.getType('text/plain').then(blob => blobAsString(blob).then(r)))
                });
            }
        }
    }

    return things;
};

export const parseClipboardThings = async (things: ClipboardThing[]): Promise<PlaitPasteDataType | null> => {
    const clipboardFiles = things.filter(t => (t.type === 'file' || t.type === 'blob') && t.source !== null) as Extract<
        ClipboardThing,
        { type: 'file' } | { type: 'blob' }
    >[];
    // Just paste the files, nothing else
    if (clipboardFiles.length) {
        const fileBlobs = await Promise.all(clipboardFiles.map(t => t.source!));
        const urls = (fileBlobs.filter(Boolean) as (File | Blob)[]).map(blob => URL.createObjectURL(blob));
        const files = urls.map(async url => {
            const blob = await (await fetch(url)).blob();
            return new File([blob], 'plait-file', { type: blob.type });
        });
        return {
            type: 'file',
            value: files
        } as PlaitPasteDataType<Promise<File>[]>;
    }

    // 2. Generate clipboard results for non-file things
    // Getting the source from the items is async, however they must be accessed syncronously;
    // we can't await them in a loop. So we'll map them to promises and await them all at once,
    // then make decisions based on what we find.
    const results = await Promise.all<PlaitExternalContentSource>(
        things
            .filter(t => t.type !== 'file')
            .map(
                t =>
                    new Promise(r => {
                        const thing = t as Exclude<ClipboardThing, { type: 'file' } | { type: 'blob' }>;
                        if (thing.type === 'file') {
                            r({ type: 'error', data: null, reason: 'unexpected file' });
                            return;
                        }
                        thing.source.then(text => {
                            // first, see if we can find plait content, which is JSON inside of an html comment
                            const plaitHtmlComment = text.match(/<plait[^>]*>(.*)<\/plait>/)?.[1];
                            if (plaitHtmlComment) {
                                try {
                                    const jsonComment = JSON.parse(plaitHtmlComment);
                                    if (jsonComment === null) {
                                        r({
                                            type: 'error',
                                            data: jsonComment,
                                            reason: `found plait data comment but could not parse`
                                        });
                                        return;
                                    } else {
                                        if (jsonComment.type !== `application/${CLIP_BOARD_FORMAT_KEY}`) {
                                            r({
                                                type: 'error',
                                                data: jsonComment,
                                                reason: `found plait data comment but JSON was of a different type: ${jsonComment.type}`
                                            });
                                        }
                                        if (typeof jsonComment.data === 'string') {
                                            r({
                                                type: 'error',
                                                data: jsonComment,
                                                reason: 'found plait json but data was a string instead of a TLClipboardModel object'
                                            });
                                            return;
                                        }
                                        r({ type: 'plait', data: jsonComment.value });
                                        return;
                                    }
                                } catch (e) {
                                    r({
                                        type: 'error',
                                        data: plaitHtmlComment,
                                        reason: 'found plait json but data was a string instead of a TLClipboardModel object'
                                    });
                                    return;
                                }
                            } else {
                                if (thing.type === 'html') {
                                    r({ type: 'text', data: text, subtype: 'html' });
                                    return;
                                }
                                r({ type: 'text', data: text, subtype: 'text' });
                            }
                        });
                    })
            )
    );

    // 3.
    // Now that we know what kind of stuff we're dealing with, we can actual create some content.
    // There are priorities here, so order matters: we've already handled images and files, which
    // take first priority; then we want to handle plait content, then html content,
    // and finally text content.

    // Try to paste plait content
    const plaitResult = results.find(item => item.type === 'plait');
    if (plaitResult && (plaitResult.data as PlaitElement[]).length) {
        return {
            type: 'plait',
            value: plaitResult.data
        } as PlaitPasteDataType<PlaitElement[]>;
    }

    // Try to paste text content
    let pasteTextContent: PlaitPasteDataType<string> = {
        type: 'text',
        value: ''
    };
    for (const result of results) {
        if (result.type === 'text' && result.data.trim()) {
            if (!results.some(r => r.type === 'text' && r.subtype !== 'html') && result.data.trim()) {
                // html
                pasteTextContent.value = stripHtml(result.data);
            } else if (result.subtype === 'text') {
                // text
                pasteTextContent.value = result.data;
            }
        }
    }
    return pasteTextContent;
};

const isFile = (item: ClipboardItem) => {
    return item.types.find(i => i.match(/^image\//));
};

const blobAsString = (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            const text = reader.result;
            resolve(text as string);
        });
        reader.addEventListener('error', () => {
            reject(reader.error);
        });
        reader.readAsText(blob);
    });
};

const stripHtml = (html: string) => {
    // See <https://github.com/developit/preact-markup/blob/4788b8d61b4e24f83688710746ee36e7464f7bbc/src/parse-markup.js#L60-L69>
    const doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html.trim();
    return doc.body.textContent || doc.body.innerText || '';
};
