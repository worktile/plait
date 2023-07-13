import { BASE } from '../../constants/default';
import { PlaitMind } from '../../interfaces/element';
import { MindElement } from '../../interfaces/element';
import { EmojiData } from '../../interfaces/element-data';
import { WithMindOptions } from '../../interfaces/options';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { WithMindPluginKey } from '../../public-api';
import { getEmojisWidthHeight } from './emoji';

const NodeDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 3,
        emojiAndText: BASE * 1.5
    },
    vertical: {
        nodeAndText: BASE * 1.5,
        nodeAndImage: BASE,
        imageAndText: BASE * 1.5
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
        const imageWidth = MindElement.hasImage(element) ? element.data.image?.width : 0;
        if (MindElement.hasEmojis(element)) {
            return (
                NodeSpace.getEmojiLeftSpace(board, element) +
                getEmojisWidthHeight(board, element).width +
                getSpaceEmojiAndText(element) +
                Math.max(element.width, imageWidth) +
                nodeAndText
            );
        }
        return nodeAndText + Math.max(element.width, imageWidth) + nodeAndText;
    },
    getNodeHeight(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        if (MindElement.hasImage(element)) {
            return (
                NodeDefaultSpace.vertical.nodeAndImage +
                element.data.image.height +
                NodeDefaultSpace.vertical.imageAndText +
                element.height +
                nodeAndText
            );
        }
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
        if (MindElement.hasImage(element)) {
            return element.data.image.height + NodeDefaultSpace.vertical.nodeAndImage + NodeDefaultSpace.vertical.imageAndText;
        } else {
            return nodeAndText;
        }
    },
    getImageTopSpace(element: MindElement) {
        return NodeDefaultSpace.vertical.nodeAndImage;
    },
    getEmojiLeftSpace(board: PlaitMindBoard, element: MindElement<EmojiData>) {
        const options = board.getPluginOptions<WithMindOptions>(WithMindPluginKey);
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        return nodeAndText - options.emojiPadding;
    },
    getEmojiTopSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    }
};
