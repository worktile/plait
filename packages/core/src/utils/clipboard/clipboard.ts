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

const getStringFromDataTransferItem = (item: DataTransferItem) => {
    return new Promise<string>((resolve) => {
        item.getAsString((value) => {
            resolve(value || '');
        });
    });
};

const getSvgClipboardData = async (dataTransfer: DataTransfer): Promise<ClipboardData | null> => {
    const svgItem = Array.from(dataTransfer.items || []).find((item) => item.kind === 'string' && item.type === SVG_MIME_TYPE);
    const svgText = svgItem ? await getStringFromDataTransferItem(svgItem) : dataTransfer.getData(SVG_MIME_TYPE);
    if (!svgText.trim()) {
        return null;
    }
    return {
        files: [new File([svgText], 'plait-svg-image.svg', { type: SVG_MIME_TYPE })]
    };
};

const hasSvgClipboardType = (dataTransfer: DataTransfer) => {
    return Array.from(dataTransfer.items || []).some((item) => item.type === SVG_MIME_TYPE);
};

const getNavigatorClipboardSafely = async (): Promise<ClipboardData> => {
    if (!getProbablySupportsClipboardRead()) {
        return {};
    }
    try {
        return await getNavigatorClipboard();
    } catch {
        return {};
    }
};

export const cacheClipboardData = (clipboardData: ClipboardData) => {
    (window as any)['plait_fallback_clipboard_data'] = clipboardData;
};

export const getCachedClipboardData = () => {
    return (window as any)['plait_fallback_clipboard_data'] || null;
};

export const getClipboardData = async (dataTransfer: DataTransfer | null): Promise<ClipboardData | null> => {
    let clipboardData: ClipboardData = {};
    if (dataTransfer) {
        if (dataTransfer.files.length) {
            return { files: Array.from(dataTransfer.files) };
        }
        const hasSvgType = hasSvgClipboardType(dataTransfer);
        clipboardData = getDataTransferClipboard(dataTransfer);
        if (Object.keys(clipboardData).length > 0) {
            return clipboardData;
        }
        const svgClipboardData = await getSvgClipboardData(dataTransfer);
        if (svgClipboardData) {
            return svgClipboardData;
        }
        if (hasSvgType) {
            const navigatorClipboardData = await getNavigatorClipboardSafely();
            if (navigatorClipboardData.files?.length) {
                return navigatorClipboardData;
            }
        }
        clipboardData = getDataTransferClipboardText(dataTransfer);
        return clipboardData;
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
