import { EmojiData, MindElement, PlaitMind } from '../../interfaces';

export function getEmojisRectangle(element: MindElement<EmojiData>) {
    const count = element.data.emojis.length;
    const fontSize = getEmojiFontSize(element);
    return { width: fontSize * count, height: fontSize * 1.5 };
}

export function getEmojiFontSize(element: MindElement<EmojiData>) {
    if (PlaitMind.isMind(element)) {
        return 18;
    } else {
        return 14;
    }
}
