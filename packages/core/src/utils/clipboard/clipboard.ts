import {
    buildPlaitHtml,
    getProbablySupportsClipboardRead,
    getProbablySupportsClipboardWrite,
    getProbablySupportsClipboardWriteText
} from './common';
import {
    getDataTransferClipboard,
    getDataTransferClipboardText,
    setDataTransferClipboard,
    setDataTransferClipboardText
} from './data-transfer';
import { getNavigatorClipboard, setNavigatorClipboard } from './navigator-clipboard';
import { ClipboardData, WritableClipboardContext } from './types';

const SVG_MIME_TYPE = 'image/svg+xml';

const readDataTransferItemAsString = (item: DataTransferItem): Promise<string> => {
    return new Promise<string>((resolve) => {
        item.getAsString((value) => {
            resolve(value || '');
        });
    });
};

const readSvgText = async (dataTransfer: DataTransfer): Promise<string> => {
    const svgText = dataTransfer.getData(SVG_MIME_TYPE);
    const svgItem = Array.from(dataTransfer.items || []).find((item) => item.kind === 'string' && item.type === SVG_MIME_TYPE);
    if (svgText.trim()) {
        return svgText;
    }

    return svgItem ? await readDataTransferItemAsString(svgItem) : '';
};

const createSvgClipboardData = (svgText: string): ClipboardData => {
    return {
        files: [new File([svgText], 'plait-svg-image.svg', { type: SVG_MIME_TYPE })]
    };
};

export const cacheClipboardData = (clipboardData: ClipboardData) => {
    (window as any)['plait_fallback_clipboard_data'] = clipboardData;
};

export const getCachedClipboardData = () => {
    return (window as any)['plait_fallback_clipboard_data'] || null;
};

export const getClipboardData = async (dataTransfer: DataTransfer | null): Promise<ClipboardData | null> => {
    if (dataTransfer) {
        if (dataTransfer.files.length) {
            return { files: Array.from(dataTransfer.files) };
        }
        const plaitClipboardData = getDataTransferClipboard(dataTransfer);
        if (Object.keys(plaitClipboardData).length > 0) {
            return plaitClipboardData;
        }
        const svgTextPromise = readSvgText(dataTransfer);
        // DataTransfer is event-scoped, so preserve the plain-text fallback before awaiting the SVG item.
        const textClipboardData = getDataTransferClipboardText(dataTransfer);
        const svgText = await svgTextPromise;
        if (svgText.trim()) {
            return createSvgClipboardData(svgText);
        }
        return textClipboardData;
    }
    if (getProbablySupportsClipboardRead()) {
        return await getNavigatorClipboard();
    }
    return null;
};

export const setClipboardData = async (dataTransfer: DataTransfer | null, clipboardContext: WritableClipboardContext | null) => {
    if (!clipboardContext) {
        return;
    }
    const { type, elements, text } = clipboardContext;

    if (getProbablySupportsClipboardWrite()) {
        return await setNavigatorClipboard(type, elements, text);
    }

    if (dataTransfer) {
        setDataTransferClipboard(dataTransfer, type, elements);
        setDataTransferClipboardText(dataTransfer, text);
        cacheClipboardData(clipboardContext);
        return;
    }

    // Compatible with situations where navigator.clipboard.write is not supported and dataTransfer is empty
    // Such as contextmenu copy in Firefox.
    if (getProbablySupportsClipboardWriteText()) {
        return await navigator.clipboard.writeText(buildPlaitHtml(type, elements));
    }
};
