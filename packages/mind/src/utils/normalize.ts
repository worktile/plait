import { MindElement } from '../interfaces/element';
import { ParagraphElement } from '@plait/common';

export const isNormalizedData = (element: MindElement) => {
    if (!element.data || !element.data.topic) {
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
