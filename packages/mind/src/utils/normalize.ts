import { MindElement } from '../interfaces/element';

export const isNormalized = (element: MindElement) => {
    if (!element.data || !element.data.topic) {
        return false;
    }
    return true;
};

export const normalizedElement = (element: MindElement) => {
    const data = {
        topic: {
            children: [
                {
                    text: ''
                }
            ]
        }
    };
    element.data = data;
    element.width = 56;
    element.height = 20;
};
