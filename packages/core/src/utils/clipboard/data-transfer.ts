import { getClipboardFromHtml } from './common';
import { ClipboardData, WritableClipboardData, WritableClipboardType } from './types';

export const setDataTransferClipboard = (dataTransfer: DataTransfer | null, type: WritableClipboardType, data: WritableClipboardData) => {
    const writableData = {
        type,
        data
    };
    const stringObj = JSON.stringify(writableData);
    dataTransfer?.setData(`text/html`, `<plait>${stringObj}</plait>`);
};

export const setDataTransferClipboardByText = (data: DataTransfer | null, text: string) => {
    const pluginContextResult = getDataTransferClipboardText(data);
    data?.setData(`text/plain`, text + '\n' + pluginContextResult);
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
