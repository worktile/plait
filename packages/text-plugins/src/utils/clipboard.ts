import { Element, Node } from 'slate';
import { CLIPBOARD_FORMAT_KEY } from '../constant';

export const getTextFromClipboard = (data: DataTransfer | null) => {
    let plaitTextData = data?.getData(`application/${CLIPBOARD_FORMAT_KEY}`);
    const text = (data ? data.getData(`text/plain`) : '') as string;
    if (plaitTextData) {
        const decoded = decodeURIComponent(window.atob(plaitTextData));
        const res = JSON.parse(decoded) as Element[];
        if (res.length === 1 && Node.string(res[0])) {
            return res[0];
        }
    }
    return text.trim() || '';
};
