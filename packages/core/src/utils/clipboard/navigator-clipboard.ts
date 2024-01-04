import { ClipboardData, WritableClipboardData, WritableClipboardType } from './types';

export const setNavigatorClipboard = async (type: WritableClipboardType, data: WritableClipboardData, text: string = '') => {
    let textClipboard = text;
    if ('clipboard' in navigator && 'write' in navigator.clipboard) {
        const stringifiedClipboard = JSON.stringify({
            type,
            data
        });
        if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': new Blob([`<plait>${stringifiedClipboard}</plait>`], {
                        type: 'text/html'
                    }),
                    'text/plain': new Blob([JSON.stringify(textClipboard ?? data)], { type: 'text/plain' })
                })
            ]);
        }
    }
};

export const getNavigatorClipboard = async (): Promise<ClipboardData | null> => {
    if (!('clipboard' in navigator && 'read' in navigator.clipboard)) {
        return null;
    }
    const clipboardItems = await navigator.clipboard.read();
    let clipboardData: ClipboardData = {};

    if (Array.isArray(clipboardItems) && clipboardItems[0] instanceof ClipboardItem) {
        for (const item of clipboardItems) {
            if (isFile(item)) {
                const clipboardFiles = item.types.filter(type => type.match(/^image\//));
                const fileBlobs = await Promise.all(clipboardFiles.map(type => item.getType(type)!));
                const urls = (fileBlobs.filter(Boolean) as (File | Blob)[]).map(blob => URL.createObjectURL(blob));
                const files = await Promise.all(
                    urls.map(async url => {
                        const blob = await (await fetch(url)).blob();
                        return new File([blob], 'plait-file', { type: blob.type });
                    })
                );
                return {
                    files
                };
            }
            if (item.types.includes('text/html')) {
                const htmlContent = await blobAsString(await item.getType('text/html'));
                const plaitHtmlComment = htmlContent.match(/<plait[^>]*>(.*)<\/plait>/)?.[1];
                if (plaitHtmlComment) {
                    try {
                        const jsonComment = JSON.parse(plaitHtmlComment);
                        if (jsonComment) {
                            if (jsonComment.type === WritableClipboardType.elements) {
                                return {
                                    elements: jsonComment.data
                                };
                            } else if (jsonComment.type === WritableClipboardType.medias) {
                                return {
                                    medias: jsonComment.data
                                };
                            } else {
                                clipboardData = {
                                    text: jsonComment.data
                                };
                            }
                        }
                    } catch (error) {
                        console.error(error);
                    }
                } else if (htmlContent && htmlContent.trim()) {
                    clipboardData = {
                        text: stripHtml(htmlContent)
                    };
                }
            }
            if (item.types.includes('text/plain')) {
                const textContent = await blobAsString(await item.getType('text/plain'));
                clipboardData = {
                    text: stripHtml(textContent)
                };
            }
        }
    }
    return clipboardData;
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
