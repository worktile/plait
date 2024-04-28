import { ClipboardData, WritableClipboardContext, WritableClipboardData, WritableClipboardOperationType, WritableClipboardType } from './types';

export const buildPlaitHtml = (type: WritableClipboardType, data: WritableClipboardData) => {
    const stringifiedClipboard = JSON.stringify({
        type,
        data
    });
    return `<plait>${stringifiedClipboard}</plait>`;
};

export const getClipboardFromHtml = (html: string): ClipboardData | null => {
    const plaitString = html?.match(/<plait[^>]*>(.*)<\/plait>/)?.[1];
    if (plaitString) {
        try {
            const plaitJson = JSON.parse(plaitString);
            if (plaitJson) {
                if (plaitJson.type === WritableClipboardType.elements) {
                    return {
                        elements: plaitJson.data
                    };
                } else if (plaitJson.type === WritableClipboardType.medias) {
                    return {
                        medias: plaitJson.data
                    };
                }
            }
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    return null;
};

export const stripHtml = (html: string) => {
    // See <https://github.com/developit/preact-markup/blob/4788b8d61b4e24f83688710746ee36e7464f7bbc/src/parse-markup.js#L60-L69>
    const doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = html.trim();
    return doc.body.textContent || doc.body.innerText || '';
};

export const getProbablySupportsClipboardWrite = () => {
    return 'clipboard' in navigator && 'write' in navigator.clipboard;
};

export const getProbablySupportsClipboardWriteText = () => {
    return 'clipboard' in navigator && 'writeText' in navigator.clipboard;
};

export const getProbablySupportsClipboardRead = () => {
    return 'clipboard' in navigator && 'read' in navigator.clipboard;
};

export const createClipboardContext = (
    type: WritableClipboardType,
    elements: WritableClipboardData,
    text: string,
    operationType?: WritableClipboardOperationType
): WritableClipboardContext => {
    return {
        type,
        elements,
        text,
        operationType
    };
};

export const addClipboardContext = (
    clipboardContext: WritableClipboardContext,
    addition: WritableClipboardContext
): WritableClipboardContext => {
    const { type, elements, text } = clipboardContext;
    if (type === addition.type) {
        return {
            type,
            elements: elements.concat(addition.elements),
            text: text + ' ' + addition.text
        };
    }
    return clipboardContext;
};
