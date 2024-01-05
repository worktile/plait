import { buildPlaitHtml, getClipboardFromHtml } from './common';
import { ClipboardData, WritableClipboardData, WritableClipboardType } from './types';

export const setDataTransferClipboard = (dataTransfer: DataTransfer | null, type: WritableClipboardType, data: WritableClipboardData) => {
    dataTransfer?.setData(`text/html`, buildPlaitHtml(type, data));
};

export const setDataTransferClipboardText = (data: DataTransfer | null, text: string) => {
    data?.setData(`text/plain`, text);
};

export const getDataTransferClipboard = (data: DataTransfer | null): ClipboardData => {
    const html = data?.getData(`text/html`);
    if (html) {
        const htmlClipboardData = getClipboardFromHtml(html);
        if (htmlClipboardData) {
            return htmlClipboardData;
        }
    }

    return {};
};

export const getDataTransferClipboardText = (data: DataTransfer | null) => {
    return (data ? data.getData(`text/plain`) : '') as string;
};
