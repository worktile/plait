import { WithMindPluginKey } from '../../constants/default';
import { EmojiData, MindElement, PlaitMind } from '../../interfaces';
import { WithMindOptions } from '../../interfaces/options';
import { PlaitMindBoard } from '../../plugins/with-mind.board';

export function getEmojisWidthHeight(board: PlaitMindBoard, element: MindElement<EmojiData>) {
    const options = board.getPluginOptions<WithMindOptions>(WithMindPluginKey);
    const count = element.data.emojis.length;
    const fontSize = getEmojiFontSize(element);
    return {
        width: fontSize * count + count * 2 * options.emojiPadding + (count - 1) * options.spaceBetweenEmojis,
        height: element.height
    };
}

export function getEmojiFontSize(element: MindElement<EmojiData>) {
    if (PlaitMind.isMind(element)) {
        return 18 + 2;
    } else {
        return 14 + 2;
    }
}
