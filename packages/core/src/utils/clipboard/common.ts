import { ClipboardData, WritableClipboardData, WritableClipboardType } from './types';

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
