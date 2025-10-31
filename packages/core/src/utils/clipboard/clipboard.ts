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

export const cacheClipboardData = (clipboardData: ClipboardData) => {
    (window as any)['plait_fallback_clipboard_data'] = clipboardData;
};

export const getCachedClipboardData = () => {
    return (window as any)['plait_fallback_clipboard_data'] || null;
};

export const getClipboardData = async (dataTransfer: DataTransfer | null): Promise<ClipboardData | null> => {
    let clipboardData = {};
    if (dataTransfer) {
        if (dataTransfer.files.length) {
            return { files: Array.from(dataTransfer.files) };
        }
        clipboardData = getDataTransferClipboard(dataTransfer);
        if (Object.keys(clipboardData).length === 0) {
            clipboardData = getDataTransferClipboardText(dataTransfer);
        }
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
