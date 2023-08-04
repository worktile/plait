import { MindElement } from '../interfaces/element';
import { PlaitBoard, Transforms } from '@plait/core';
import { EmojiData, EmojiItem } from '../interfaces/element-data';

export const addEmoji = (board: PlaitBoard, element: MindElement, emojiItem: EmojiItem) => {
    const emojis = element.data.emojis || [];
    const newEmojis = [...emojis];
    newEmojis.push(emojiItem);
    const newElement = {
        data: { ...element.data, emojis: newEmojis }
    } as MindElement;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const removeEmoji = (board: PlaitBoard, element: MindElement<EmojiData>, emojiItem: EmojiItem) => {
    const emojis = element.data.emojis.filter(value => value !== emojiItem);
    const newElement = {
        data: { topic: element.data.topic }
    } as MindElement;

    if (MindElement.hasImage(element)) {
        newElement.data.image = element.data.image;
    }

    if (emojis.length > 0) {
        newElement.data.emojis = emojis;
    }
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};

export const replaceEmoji = (board: PlaitBoard, element: MindElement<EmojiData>, oldEmoji: EmojiItem, newEmoji: EmojiItem) => {
    const newElement = {
        data: { ...element.data }
    } as MindElement;
    const newEmojis = element.data.emojis.map(value => {
        if (value === oldEmoji) {
            return newEmoji;
        }
        return value;
    });
    newElement.data.emojis = newEmojis;
    const path = PlaitBoard.findPath(board, element);
    Transforms.setNode(board, newElement, path);
};
