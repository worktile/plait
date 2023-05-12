import { EmojiData, MindElement, PlaitMind } from '../../interfaces';

export function getEmojisRectangle(element: MindElement<EmojiData>) {
    const count = element.data.emojis.length;
    const fontSize = getEmojiFontSize(element);
    return { width: fontSize * count + (count - 1) * 4, height: element.height };
}

export function getEmojiFontSize(element: MindElement<EmojiData>) {
    if (PlaitMind.isMind(element)) {
        return 18 + 2;
    } else {
        return 14 + 2;
    }
}
