import { BASE } from '../../constants/default';
import { PlaitMind } from '../../interfaces/element';
import { MindElement } from '../../interfaces/element';
import { PlaitMindBoard } from '../../plugins/with-extend-mind';
import { EmojiData } from '../../interfaces/element-data';
import { getEmojisWidthHeight } from '../../plugins/emoji/emoji';

const NodeDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 3,
        emojiAndText: BASE * 1.5
    },
    vertical: {
        nodeAndText: BASE * 1.5
    }
};

const RootDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 4,
        emojiAndText: BASE * 2
    },
    vertical: {
        nodeAndText: BASE * 2
    }
};

const getHorizontalSpaceBetweenNodeAndText = (board: PlaitMindBoard, element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.horizontal.nodeAndText : NodeDefaultSpace.horizontal.nodeAndText;
    return nodeAndText;
};

const getVerticalSpaceBetweenNodeAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.vertical.nodeAndText : NodeDefaultSpace.vertical.nodeAndText;
    return nodeAndText;
};

const getSpaceEmojiAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const emojiAndText = isMind ? RootDefaultSpace.horizontal.emojiAndText : NodeDefaultSpace.horizontal.emojiAndText;
    return emojiAndText;
};

export const NodeSpace = {
    getNodeWidth(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasEmojis(element)) {
            return (
                NodeSpace.getEmojiLeftSpace(board, element) +
                getEmojisWidthHeight(board, element).width +
                getSpaceEmojiAndText(element) +
                element.width +
                nodeAndText
            );
        }
        return nodeAndText + element.width + nodeAndText;
    },
    getNodeHeight(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText + element.height + nodeAndText;
    },
    getTextLeftSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasEmojis(element)) {
            return NodeSpace.getEmojiLeftSpace(board, element) + getEmojisWidthHeight(board, element).width + getSpaceEmojiAndText(element);
        } else {
            return nodeAndText;
        }
    },
    getTextTopSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    },
    getEmojiLeftSpace(board: PlaitMindBoard, element: MindElement<EmojiData>) {
        const options = board.getMindOptions();
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        return nodeAndText - options.emojiPadding;
    },
    getEmojiTopSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    }
};
