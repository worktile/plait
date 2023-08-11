import { CLIP_BOARD_FORMAT_KEY } from '../constants';
import { PlaitElement } from '../interfaces';

export const getClipboardByKey = (key: string) => {
    return `application/x-plait-${key}-fragment`;
};

export const setClipboardData = (data: DataTransfer | null, elements: PlaitElement[]) => {
    const result = [...elements];
    const pluginContextResult = getDataFromClipboard(data);
    if (pluginContextResult) {
        result.push(...pluginContextResult);
    }
    const stringObj = JSON.stringify(result);
    const encoded = window.btoa(encodeURIComponent(stringObj));
    data?.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
};

export const setClipboardDataByText = (data: DataTransfer | null, text: string) => {
    const pluginContextResult = getTextFromClipboard(data);
    data?.setData(`text/plain`, text + '\n' + pluginContextResult);
};

export const setClipboardDataByMedia = <T extends Object>(data: DataTransfer | null, media: T, key: string) => {
    const stringObj = JSON.stringify(media);
    const encoded = window.btoa(encodeURIComponent(stringObj));
    data?.setData(getClipboardByKey(key), encoded);
};

export const getDataFromClipboard = (data: DataTransfer | null) => {
    const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
    let nodesData: PlaitElement[] = [];
    if (encoded) {
        const decoded = decodeURIComponent(window.atob(encoded));
        nodesData = JSON.parse(decoded);
    }
    return nodesData;
};

export const getTextFromClipboard = (data: DataTransfer | null) => {
    return (data ? data.getData(`text/plain`) : '') as string;
};

export const getClipboardDataByMedia = (data: DataTransfer | null, key: string) => {
    const encoded = data?.getData(getClipboardByKey(key));
    let imageItem = null;
    if (encoded) {
        const decoded = decodeURIComponent(window.atob(encoded));
        imageItem = JSON.parse(decoded);
    }
    return imageItem;
};
