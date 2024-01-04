import { ClipboardData, WritableClipboardData, WritableClipboardType } from './types';

export const setClipboardData = (dataTransfer: DataTransfer | null, type: WritableClipboardType, data: WritableClipboardData) => {
    const writableData = {
        type,
        data
    };
    const stringObj = JSON.stringify(writableData);
    dataTransfer?.setData(`text/html`, `<plait>${stringObj}</plait>`);
};

export const setClipboardDataByText = (data: DataTransfer | null, text: string) => {
    const pluginContextResult = getTextFromClipboard(data);
    data?.setData(`text/plain`, text + '\n' + pluginContextResult);
};

export const getClipboardData = (data: DataTransfer | null): ClipboardData => {
    const html = data?.getData(`text/html`);
    const stringObj = html?.match(/<plait[^>]*>(.*)<\/plait>/)?.[1];
    if (stringObj) {
        const jsonResult = JSON.parse(stringObj);
        if (jsonResult.type === WritableClipboardType.elements) {
            return { elements: jsonResult.data };
        } else {
            return { medias: jsonResult.data };
        }
    }
    return {};
};

export const getTextFromClipboard = (data: DataTransfer | null) => {
    return (data ? data.getData(`text/plain`) : '') as string;
};
