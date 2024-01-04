import { getProbablySupportsClipboardRead, getProbablySupportsClipboardWrite } from './common';
import {
    getDataTransferClipboard,
    getDataTransferClipboardText,
    setDataTransferClipboard,
    setDataTransferClipboardByText
} from './data-transfer';
import { getNavigatorClipboard, setNavigatorClipboard } from './navigator-clipboard';
import { ClipboardData, WritableClipboardContext } from './types';

export const getClipboardData = async (dataTransfer: DataTransfer | null): Promise<ClipboardData> => {
    let clipboardData = {};
    if (dataTransfer) {
        if (dataTransfer.files.length) {
            return { files: Array.from(dataTransfer.files) };
        }
        clipboardData = getDataTransferClipboard(dataTransfer);
        if (Object.keys(clipboardData).length === 0) {
            clipboardData = {
                text: getDataTransferClipboardText(dataTransfer)
            };
        }
        return clipboardData;
    }
    if (getProbablySupportsClipboardWrite()) {
        return await getNavigatorClipboard();
    }
    return clipboardData;
};

export const setClipboardData = async (dataTransfer: DataTransfer | null, clipboardContext: WritableClipboardContext | null) => {
    if (!clipboardContext) {
        return;
    }
    const { type, data, text } = clipboardContext;
    if (getProbablySupportsClipboardRead()) {
        return await setNavigatorClipboard(type, data, text);
    }
    if (dataTransfer) {
        setDataTransferClipboard(dataTransfer, type, data);
        setDataTransferClipboardByText(dataTransfer, text);
    }
};
