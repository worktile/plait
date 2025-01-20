import { isNullOrUndefined } from '@plait/core';
import { MindElement } from '../interfaces/element';
import { ParagraphElement } from '@plait/common';

export const isNormalizedData = (element: MindElement) => {
    if (!element.data || !element.data.topic) {
        return false;
    }
    return true;
};

export const isNormalizedWidthAndHeight = (element: MindElement) => {
    if (isNullOrUndefined(element.width) || isNullOrUndefined(element.height)) {
        return false;
    }
    return true;
};

export const fixMindElementData = (element: MindElement) => {
    const emptyTopic = {
        children: [
            {
                text: ''
            }
        ]
    } as ParagraphElement;
    if (!element.data) {
        const data = {
            topic: emptyTopic
        };
        element.data = data;
    } else if (!element.data.topic) {
        element.data.topic = emptyTopic;
    }
};

export const fixMindElementWidthAndHeight = (element: MindElement) => {
    if (isNullOrUndefined(element.width)) {
        element.width = 56;
    }
    if (isNullOrUndefined(element.height)) {
        element.width = 20;
    }
};
