import { Element } from 'slate';
import { Alignment, ParagraphElement } from '../custom-types';

export const buildText = (text: string | Element, align?: Alignment) => {
    const plaitText = typeof text === 'string' ? { children: [{ text }] } : text;
    if (align) {
        (plaitText as ParagraphElement).align = align;
    }
    return plaitText;
};

export const isUrl = (string: string) => {
    const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
    const localhostDomainRE = /^localhost[\:?\d]*(?:[^\:?\d]\S*)?$/;
    const nonLocalhostDomainRE = /^[^\s\.]+\.\S{2,}$/;

    if (typeof string !== 'string') {
        return false;
    }

    var match = string.match(protocolAndDomainRE);
    if (!match) {
        return false;
    }

    var everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
        return false;
    }

    if (localhostDomainRE.test(everythingAfterProtocol) || nonLocalhostDomainRE.test(everythingAfterProtocol)) {
        return true;
    }

    return false;
};
