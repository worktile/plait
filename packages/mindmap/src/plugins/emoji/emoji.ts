import { EmojiData, MindElement, PlaitMind } from '../../interfaces';

export function getEmojiSize(element: MindElement<EmojiData>) {
    const count = element.data.emojis.length;
    const fontSize = getEmojiFontSize(element);
    return { width: fontSize * count, height: fontSize };
}

export function getEmojiFontSize(element: MindElement<EmojiData>) {
    if (PlaitMind.isMind(element)) {
        return 18;
    } else {
        return 14;
    }
}
