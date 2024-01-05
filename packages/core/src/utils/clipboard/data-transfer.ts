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
    if (!data) {
        return {};
    }
    const text = data?.getData(`text/plain`);
    if (text) {
        const htmlClipboardData = getClipboardFromHtml(text);
        if (htmlClipboardData) {
            return htmlClipboardData;
        }
    }
    return {
        text
    };
};
